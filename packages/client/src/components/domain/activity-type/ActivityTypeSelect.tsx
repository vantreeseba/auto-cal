import { graphql } from '@/__generated__/index.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@apollo/client/react';

const GET_ACTIVITY_TYPES = graphql(`
  query GetActivityTypesForSelect {
    myActivityTypes {
      id
      name
      color
    }
  }
`);

interface ActivityTypeSelectProps {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  onBlur?: () => void;
}

const NONE_VALUE = '__none__';

export function ActivityTypeSelect({
  value,
  onValueChange,
  onBlur,
}: ActivityTypeSelectProps) {
  const { data } = useQuery(GET_ACTIVITY_TYPES);

  const activityTypes = data?.myActivityTypes ?? [];

  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(v) => onValueChange(v === NONE_VALUE ? undefined : v)}
    >
      <SelectTrigger onBlur={onBlur}>
        <SelectValue placeholder="None">
          {value
            ? (() => {
                const at = activityTypes.find((a) => a.id === value);
                return at ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: at.color }}
                    />
                    {at.name}
                  </span>
                ) : (
                  'None'
                );
              })()
            : 'None'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>
          <span className="text-muted-foreground">None</span>
        </SelectItem>
        {activityTypes.map((at) => (
          <SelectItem key={at.id} value={at.id}>
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: at.color }}
              />
              {at.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
