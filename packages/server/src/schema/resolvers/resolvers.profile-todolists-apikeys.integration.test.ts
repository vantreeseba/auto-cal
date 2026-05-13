import { graphql } from 'graphql';
import { beforeAll, describe, expect, it } from 'vitest';
import { createLoaders } from '../../context.ts';
import {
  type TestDb,
  type TestSchema,
  buildTestSchema,
  createTestDb,
  gql,
  seedActivityType,
  seedTodo,
  seedTodoList,
  seedUser,
} from './test-helpers.ts';

/** Execute with an authenticated API key context (for guard tests). */
async function gqlWithApiKey(
  testSchema: TestSchema,
  db: TestDb,
  userId: string,
  source: string,
  variableValues?: Record<string, unknown>,
) {
  return graphql({
    schema: testSchema,
    source,
    variableValues,
    contextValue: {
      db,
      userId,
      loaders: createLoaders(db),
      apiKey: { id: 'test-key-id', scopes: ['read', 'write'] as const },
    },
  });
}

describe('profile, todo-list, and api-key resolvers', () => {
  let db: TestDb;
  let testSchema: TestSchema;

  beforeAll(async () => {
    db = await createTestDb();
    testSchema = buildTestSchema(db);
  }, 30000);

  // ─── myProfile ────────────────────────────────────────────────────────────────

  describe('myProfile', () => {
    it('throws when not authenticated', async () => {
      const result = await gql(
        testSchema,
        db,
        '',
        'query { myProfile { id } }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not authenticated/i);
    });

    it('returns the current user profile', async () => {
      const { id: userId, email } = await seedUser(db, 'profile@example.com');
      const result = await gql(
        testSchema,
        db,
        userId,
        'query { myProfile { id email icalSecret } }',
      );
      expect(result.errors).toBeUndefined();
      const profile = result.data?.myProfile as { id: string; email: string };
      expect(profile.id).toBe(userId);
      expect(profile.email).toBe(email);
    });
  });

  // ─── myUpdateProfile ──────────────────────────────────────────────────────────

  describe('myUpdateProfile', () => {
    it('throws when not authenticated', async () => {
      const result = await gql(
        testSchema,
        db,
        '',
        'mutation { myUpdateProfile(timezone: "UTC") }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not authenticated/i);
    });

    it('updates the user timezone and returns true', async () => {
      const { id: userId } = await seedUser(db, 'update-profile@example.com');
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($tz: String!) { myUpdateProfile(timezone: $tz) }',
        { tz: 'America/New_York' },
      );
      expect(result.errors).toBeUndefined();
      expect(result.data?.myUpdateProfile).toBe(true);
    });

    it('throws for an invalid timezone', async () => {
      const { id: userId } = await seedUser(
        db,
        'update-profile-badtz@example.com',
      );
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation { myUpdateProfile(timezone: "Not/ATimezone") }',
      );
      expect(result.errors?.[0]?.message).toMatch(/invalid timezone/i);
    });
  });

  // ─── myRegenerateIcalSecret ───────────────────────────────────────────────────

  describe('myRegenerateIcalSecret', () => {
    it('throws when not authenticated', async () => {
      const result = await gql(
        testSchema,
        db,
        '',
        'mutation { myRegenerateIcalSecret }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not authenticated/i);
    });

    it('returns a new UUID secret', async () => {
      const { id: userId } = await seedUser(db, 'regen-secret@example.com');
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation { myRegenerateIcalSecret }',
      );
      expect(result.errors).toBeUndefined();
      const newSecret = result.data?.myRegenerateIcalSecret as string;
      expect(newSecret).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  // ─── myTodoLists ──────────────────────────────────────────────────────────────

  describe('myTodoLists', () => {
    it('throws when not authenticated', async () => {
      const result = await gql(
        testSchema,
        db,
        '',
        'query { myTodoLists { id } }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not authenticated/i);
    });

    it("returns only the current user's lists", async () => {
      const { id: userId } = await seedUser(
        db,
        'todolists-isolation@example.com',
      );
      const { id: otherId } = await seedUser(db, 'todolists-other@example.com');
      const at = await seedActivityType(db, userId);
      const otherAt = await seedActivityType(db, otherId);
      await seedTodoList(db, userId, at.id);
      await seedTodoList(db, otherId, otherAt.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'query { myTodoLists { id } }',
      );
      expect(result.errors).toBeUndefined();
      expect((result.data?.myTodoLists as unknown[]).length).toBe(1);
    });
  });

  // ─── myCreateTodoList ─────────────────────────────────────────────────────────

  describe('myCreateTodoList', () => {
    it('creates a list and returns it', async () => {
      const { id: userId } = await seedUser(db, 'create-list@example.com');
      const at = await seedActivityType(db, userId);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: CreateTodoListArgs!) { myCreateTodoList(input: $input) { id name } }',
        { input: { name: 'My List', activityTypeId: at.id } },
      );
      expect(result.errors).toBeUndefined();
      expect((result.data?.myCreateTodoList as { name: string }).name).toBe(
        'My List',
      );
    });

    it('throws when activity type not found', async () => {
      const { id: userId } = await seedUser(db, 'create-list-noat@example.com');
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: CreateTodoListArgs!) { myCreateTodoList(input: $input) { id } }',
        {
          input: {
            name: 'X',
            activityTypeId: '00000000-0000-0000-0000-000000000000',
          },
        },
      );
      expect(result.errors?.[0]?.message).toMatch(/not found/i);
    });

    it('throws Forbidden when activity type belongs to another user', async () => {
      const { id: userId } = await seedUser(
        db,
        'create-list-forbidden@example.com',
      );
      const { id: otherId } = await seedUser(
        db,
        'create-list-other@example.com',
      );
      const otherAt = await seedActivityType(db, otherId);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: CreateTodoListArgs!) { myCreateTodoList(input: $input) { id } }',
        { input: { name: 'Hack', activityTypeId: otherAt.id } },
      );
      expect(result.errors?.[0]?.message).toMatch(/forbidden/i);
    });
  });

  // ─── myUpdateTodoList ─────────────────────────────────────────────────────────

  describe('myUpdateTodoList', () => {
    it('updates list name', async () => {
      const { id: userId } = await seedUser(db, 'update-list@example.com');
      const at = await seedActivityType(db, userId);
      const list = await seedTodoList(db, userId, at.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: UpdateTodoListArgs!) { myUpdateTodoList(input: $input) { id name } }',
        { input: { id: list.id, name: 'Renamed' } },
      );
      expect(result.errors).toBeUndefined();
      expect((result.data?.myUpdateTodoList as { name: string }).name).toBe(
        'Renamed',
      );
    });

    it('throws when list not found', async () => {
      const { id: userId } = await seedUser(
        db,
        'update-list-notfound@example.com',
      );
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: UpdateTodoListArgs!) { myUpdateTodoList(input: $input) { id } }',
        { input: { id: '00000000-0000-0000-0000-000000000000', name: 'X' } },
      );
      expect(result.errors?.[0]?.message).toMatch(/not found/i);
    });

    it('throws Forbidden when list belongs to another user', async () => {
      const { id: userId } = await seedUser(
        db,
        'update-list-forbidden@example.com',
      );
      const { id: otherId } = await seedUser(
        db,
        'update-list-other@example.com',
      );
      const otherAt = await seedActivityType(db, otherId);
      const otherList = await seedTodoList(db, otherId, otherAt.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: UpdateTodoListArgs!) { myUpdateTodoList(input: $input) { id } }',
        { input: { id: otherList.id, name: 'Hack' } },
      );
      expect(result.errors?.[0]?.message).toMatch(/forbidden/i);
    });

    it('throws when new activity type not found', async () => {
      const { id: userId } = await seedUser(db, 'update-list-noat@example.com');
      const at = await seedActivityType(db, userId);
      const list = await seedTodoList(db, userId, at.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: UpdateTodoListArgs!) { myUpdateTodoList(input: $input) { id } }',
        {
          input: {
            id: list.id,
            activityTypeId: '00000000-0000-0000-0000-000000000000',
          },
        },
      );
      expect(result.errors?.[0]?.message).toMatch(/not found/i);
    });

    it('throws Forbidden when new activity type belongs to another user', async () => {
      const { id: userId } = await seedUser(
        db,
        'update-list-atforbidden@example.com',
      );
      const { id: otherId } = await seedUser(
        db,
        'update-list-atother@example.com',
      );
      const at = await seedActivityType(db, userId);
      const list = await seedTodoList(db, userId, at.id);
      const otherAt = await seedActivityType(db, otherId);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: UpdateTodoListArgs!) { myUpdateTodoList(input: $input) { id } }',
        { input: { id: list.id, activityTypeId: otherAt.id } },
      );
      expect(result.errors?.[0]?.message).toMatch(/forbidden/i);
    });
  });

  // ─── myDeleteTodoList ─────────────────────────────────────────────────────────

  describe('myDeleteTodoList', () => {
    it('deletes an empty list and returns true', async () => {
      const { id: userId } = await seedUser(db, 'delete-list@example.com');
      const at = await seedActivityType(db, userId);
      const list = await seedTodoList(db, userId, at.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($id: ID!) { myDeleteTodoList(id: $id) }',
        { id: list.id },
      );
      expect(result.errors).toBeUndefined();
      expect(result.data?.myDeleteTodoList).toBe(true);
    });

    it('throws when list not found', async () => {
      const { id: userId } = await seedUser(
        db,
        'delete-list-notfound@example.com',
      );
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation { myDeleteTodoList(id: "00000000-0000-0000-0000-000000000000") }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not found/i);
    });

    it('throws Forbidden when list belongs to another user', async () => {
      const { id: userId } = await seedUser(
        db,
        'delete-list-forbidden@example.com',
      );
      const { id: otherId } = await seedUser(
        db,
        'delete-list-other@example.com',
      );
      const otherAt = await seedActivityType(db, otherId);
      const otherList = await seedTodoList(db, otherId, otherAt.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($id: ID!) { myDeleteTodoList(id: $id) }',
        { id: otherList.id },
      );
      expect(result.errors?.[0]?.message).toMatch(/forbidden/i);
    });

    it('throws when list still contains todos', async () => {
      const { id: userId } = await seedUser(
        db,
        'delete-list-hastodos@example.com',
      );
      const at = await seedActivityType(db, userId);
      const list = await seedTodoList(db, userId, at.id);
      await seedTodo(db, userId, list.id);

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($id: ID!) { myDeleteTodoList(id: $id) }',
        { id: list.id },
      );
      expect(result.errors?.[0]?.message).toMatch(/cannot delete/i);
    });
  });

  // ─── myApiKeys ────────────────────────────────────────────────────────────────

  describe('myApiKeys', () => {
    it('throws when not authenticated', async () => {
      const result = await gql(
        testSchema,
        db,
        '',
        'query { myApiKeys { id } }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not authenticated/i);
    });

    it('returns active (non-revoked) keys', async () => {
      const { id: userId } = await seedUser(db, 'apikeys-list@example.com');
      await gql(
        testSchema,
        db,
        userId,
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { token } }',
        { input: { name: 'Key A', scopes: ['read'] } },
      );

      const result = await gql(
        testSchema,
        db,
        userId,
        'query { myApiKeys { id name } }',
      );
      expect(result.errors).toBeUndefined();
      expect((result.data?.myApiKeys as unknown[]).length).toBe(1);
    });
  });

  // ─── myCreateApiKey ───────────────────────────────────────────────────────────

  describe('myCreateApiKey', () => {
    it('throws when not authenticated', async () => {
      const result = await gql(
        testSchema,
        db,
        '',
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { token } }',
        { input: { name: 'X', scopes: ['read'] } },
      );
      expect(result.errors?.[0]?.message).toMatch(/not authenticated/i);
    });

    it('throws when the request itself comes from an API key', async () => {
      const { id: userId } = await seedUser(db, 'apikey-guard@example.com');
      const result = await gqlWithApiKey(
        testSchema,
        db,
        userId,
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { token } }',
        { input: { name: 'X', scopes: ['read'] } },
      );
      expect(result.errors?.[0]?.message).toMatch(/api keys cannot manage/i);
    });

    it('creates a key and returns token + row', async () => {
      const { id: userId } = await seedUser(db, 'create-apikey@example.com');
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { token apiKey { id name keyPrefix } } }',
        { input: { name: 'My Key', scopes: ['read', 'write'] } },
      );
      expect(result.errors).toBeUndefined();
      const res = result.data?.myCreateApiKey as {
        token: string;
        apiKey: { name: string; keyPrefix: string };
      };
      expect(res.token).toBeDefined();
      expect(res.apiKey.name).toBe('My Key');
      expect(res.apiKey.keyPrefix).toBeDefined();
    });

    it('creates a key with expiresAt', async () => {
      const { id: userId } = await seedUser(
        db,
        'create-apikey-expires@example.com',
      );
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { apiKey { expiresAt } } }',
        {
          input: {
            name: 'Expiring',
            scopes: ['read'],
            expiresAt: '2099-01-01T00:00:00',
          },
        },
      );
      expect(result.errors).toBeUndefined();
      const row = result.data?.myCreateApiKey as {
        apiKey: { expiresAt: string };
      };
      expect(row.apiKey.expiresAt).not.toBeNull();
    });
  });

  // ─── myRevokeApiKey ───────────────────────────────────────────────────────────

  describe('myRevokeApiKey', () => {
    it('throws when request comes from an API key', async () => {
      const { id: userId } = await seedUser(
        db,
        'revoke-apikey-guard@example.com',
      );
      const result = await gqlWithApiKey(
        testSchema,
        db,
        userId,
        'mutation { myRevokeApiKey(id: "00000000-0000-0000-0000-000000000000") }',
      );
      expect(result.errors?.[0]?.message).toMatch(/api keys cannot manage/i);
    });

    it('revokes a key and returns true', async () => {
      const { id: userId } = await seedUser(db, 'revoke-apikey@example.com');
      const createResult = await gql(
        testSchema,
        db,
        userId,
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { apiKey { id } } }',
        { input: { name: 'To Revoke', scopes: ['read'] } },
      );
      const keyId = (
        createResult.data?.myCreateApiKey as { apiKey: { id: string } }
      ).apiKey.id;

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($id: ID!) { myRevokeApiKey(id: $id) }',
        { id: keyId },
      );
      expect(result.errors).toBeUndefined();
      expect(result.data?.myRevokeApiKey).toBe(true);
    });

    it('throws when key not found', async () => {
      const { id: userId } = await seedUser(
        db,
        'revoke-apikey-notfound@example.com',
      );
      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation { myRevokeApiKey(id: "00000000-0000-0000-0000-000000000000") }',
      );
      expect(result.errors?.[0]?.message).toMatch(/not found/i);
    });

    it('throws Forbidden when key belongs to another user', async () => {
      const { id: userId } = await seedUser(
        db,
        'revoke-apikey-forbidden@example.com',
      );
      const { id: otherId } = await seedUser(
        db,
        'revoke-apikey-other@example.com',
      );
      const createResult = await gql(
        testSchema,
        db,
        otherId,
        'mutation($input: MyCreateApiKeyInput!) { myCreateApiKey(input: $input) { apiKey { id } } }',
        { input: { name: 'Other Key', scopes: ['read'] } },
      );
      const keyId = (
        createResult.data?.myCreateApiKey as { apiKey: { id: string } }
      ).apiKey.id;

      const result = await gql(
        testSchema,
        db,
        userId,
        'mutation($id: ID!) { myRevokeApiKey(id: $id) }',
        { id: keyId },
      );
      expect(result.errors?.[0]?.message).toMatch(/forbidden/i);
    });
  });
});
