# Auto Cal

**Auto Cal** is a smart todo and habit scheduling application that automatically schedules tasks within user-defined time blocks based on priority.

## What It Does

Auto Cal helps you manage single-time tasks (todos) and recurring tasks (habits) by:

- **Intelligent Scheduling**: Automatically schedules tasks based on priority within designated time blocks
- **Activity-Based Organization**: Tags tasks with activity types (work, exercise, learning, etc.)
- **Time Block Management**: Define time periods for specific activities (e.g., "5pm-7pm for exercise")
- **Habit Tracking**: Track completion rates for recurring tasks (X times per week/month)
- **Priority-Based Auto-Rescheduling**: Higher priority items trigger automatic rescheduling

## Tech Stack

### Frontend
- **React** - UI framework
- **ShadCN** - Pre-built accessible UI components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client with caching
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript

### Backend
- **Node.js** (22+) - Runtime with `--experimental-strip-types` (zero-build server)
- **Express** - Web framework
- **Apollo Server** - GraphQL server
- **drizzle-graphql** - Auto-generate GraphQL schema from Drizzle ORM
- **Drizzle ORM** - Type-safe SQL ORM
- **PGLite** - Embedded PostgreSQL database
- **Zod** - Runtime validation
- **TypeScript** - Type safety throughout

### Tooling
- **Biome** - Fast linter and formatter (replaces ESLint + Prettier)
- **GraphQL Codegen** - Generate TypeScript types from GraphQL operations
- **Drizzle Kit** - Database migrations
- **Docker** - Containerization for deployment

## Project Structure

```
auto-cal/
├── packages/
│   ├── db/                    # Database layer
│   │   ├── src/
│   │   │   ├── schema.ts      # Drizzle schema definitions
│   │   │   └── index.ts       # DB singleton (PGLite)
│   │   └── drizzle/           # Generated migrations
│   │
│   ├── server/                # GraphQL API server
│   │   └── src/
│   │       ├── index.ts       # Express + Apollo Server setup
│   │       ├── context.ts     # GraphQL context (db, userId)
│   │       └── schema/
│   │           ├── index.ts   # Schema builder
│   │           └── resolvers.ts # Custom resolvers and mutations
│   │
│   └── client/                # React frontend
│       └── src/
│           ├── main.tsx       # App entry point + Apollo Provider
│           ├── App.tsx        # Main application component
│           ├── components/    # React components
│           │   └── ui/        # ShadCN UI components
│           └── __generated__/ # GraphQL Codegen output (gitignored)
│
├── drizzle.config.ts          # Drizzle Kit configuration
├── codegen.ts                 # GraphQL Codegen configuration
├── biome.json                 # Biome linter/formatter config
├── Dockerfile                 # Production container
└── package.json               # Workspace root
```

## Getting Started

### Prerequisites

- **Node.js 22+** (for `--experimental-strip-types` support)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-cal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - GraphQL server at http://localhost:4000/graphql
   - React client at http://localhost:3000

### Development Workflow

#### Running the application
```bash
# Start all services (db, server, client)
npm run dev

# Start individual services
npm run dev:server
npm run dev:client
```

#### Type checking
```bash
# Check all packages
npm run typecheck

# Check individual packages
npm run typecheck -w @auto-cal/server
npm run typecheck -w @auto-cal/client
```

#### Linting and formatting
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

#### Database operations
```bash
# Generate migration after schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio -w @auto-cal/db
```

#### GraphQL code generation
```bash
# Generate TypeScript types from GraphQL operations
# (Server must be running at localhost:4000)
npm run codegen
```

### Building for Production

```bash
# Build client and server
npm run build

# Build Docker image
npm run build:docker

# Or use Docker directly
docker build -t auto-cal .
```

## Docker Deployment

### Build the Image

```bash
docker build -t auto-cal .
```

### Run the Container

```bash
docker run -p 4000:4000 -v $(pwd)/pgdata:/app/pgdata auto-cal
```

The application will be available at http://localhost:4000

### Environment Variables

You can override defaults when running the container:

```bash
docker run -p 4000:4000 \
  -e PORT=4000 \
  -e PGLITE_DATA_DIR=/app/pgdata \
  -v $(pwd)/pgdata:/app/pgdata \
  auto-cal
```

### Docker Compose (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  auto-cal:
    build: .
    ports:
      - "4000:4000"
    volumes:
      - ./pgdata:/app/pgdata
    environment:
      - PORT=4000
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build client and server for production |
| `npm run typecheck` | Run TypeScript type checking across all packages |
| `npm run lint` | Check for linting issues |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Run pending database migrations |
| `npm run codegen` | Generate TypeScript types from GraphQL schema |
| `npm test` | Run test suite (Vitest) |
| `npm run build:docker` | Build Docker image |

## GraphQL API

### Key Queries

- `myTodos(activityType?: String, completed?: Boolean)` - Get user's todos
- `myHabits(activityType?: String)` - Get user's habits
- `myTimeBlocks(activityType?: String, dayOfWeek?: Int)` - Get time blocks
- `activityStats(startDate: String, endDate: String)` - Activity completion stats
- `habitStats(habitId: String!, startDate: String!, endDate: String!)` - Habit completion rate

### Key Mutations

- `createTodo(input: CreateTodoInput!)` - Create a new todo
- `updateTodo(input: UpdateTodoInput!)` - Update todo details
- `completeTodo(id: String!)` - Mark todo as complete
- `deleteTodo(id: String!)` - Delete a todo
- `createHabit(input: CreateHabitInput!)` - Create a recurring habit
- `completeHabit(input: CompleteHabitInput!)` - Record habit completion
- `deleteHabit(id: String!)` - Delete a habit
- `createTimeBlock(input: CreateTimeBlockInput!)` - Define a time block
- `deleteTimeBlock(id: String!)` - Remove a time block

## Data Models

### Todo
- `title` - Task name
- `description` - Detailed description
- `priority` - 0-100 (higher = more important)
- `estimatedLength` - Duration in minutes
- `activityType` - Category (work, exercise, learning, etc.)
- `scheduledAt` - Auto-scheduled time
- `completedAt` - Completion timestamp

### Habit
- `title` - Habit name
- `description` - Detailed description
- `priority` - 0-100
- `estimatedLength` - Duration in minutes
- `activityType` - Category
- `frequencyCount` - How many times
- `frequencyUnit` - Per week or month

### Time Block
- `activityType` - What activities fit here
- `dayOfWeek` - 0 (Sunday) to 6 (Saturday)
- `startTime` - HH:MM (24-hour format)
- `endTime` - HH:MM (24-hour format)

### Habit Completion
- `habitId` - Reference to habit
- `scheduledAt` - When it was planned
- `completedAt` - When it was done

## Contributing

This project uses:
- **Biome** for linting and formatting - run `npm run lint:fix` before committing
- **Strict TypeScript** - all code must pass `npm run typecheck`
- **Zero build step server** - imports must include `.ts` extensions

See [AGENTS.md](./AGENTS.md) for detailed development patterns and conventions.

## License

MIT
