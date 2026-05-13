import { graphql } from '@/__generated__/index.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@apollo/client/react';
import { Link } from '@tanstack/react-router';

const GET_TODO_LISTS = graphql(`
  query GetTodoListsForSelect {
    myTodoLists {
      id
      name
      defaultPriority
      defaultEstimatedLength
      activityType {
        id
        name
        color
      }
    }
  }
`);

export type TodoListForSelect = {
  id: string;
  name: string;
  defaultPriority: number;
  defaultEstimatedLength: number;
  activityType: { id: string; name: string; color: string } | null;
};

interface TodoListSelectProps {
  value: string | undefined;
  onValueChange: (value: string | undefined, list?: TodoListForSelect) => void;
  onBlur?: () => void;
}

export function TodoListSelect({
  value,
  onValueChange,
  onBlur,
}: TodoListSelectProps) {
  const { data } = useQuery(GET_TODO_LISTS);

  const lists = (data?.myTodoLists ?? []) as TodoListForSelect[];

  if (lists.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No todo lists yet —{' '}
        <Link to="/todo-lists" className="underline">
          create one first
        </Link>
        .
      </p>
    );
  }

  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => {
        const list = lists.find((l) => l.id === v);
        onValueChange(v, list);
      }}
    >
      <SelectTrigger onBlur={onBlur}>
        <SelectValue placeholder="Select a list">
          {value
            ? (() => {
                const l = lists.find((x) => x.id === value);
                if (!l) return 'Select a list';
                return (
                  <span className="flex items-center gap-2">
                    {l.activityType && (
                      <span
                        className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: l.activityType.color }}
                      />
                    )}
                    {l.name}
                  </span>
                );
              })()
            : 'Select a list'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {lists.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            <span className="flex items-center gap-2">
              {l.activityType && (
                <span
                  className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: l.activityType.color }}
                />
              )}
              {l.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
