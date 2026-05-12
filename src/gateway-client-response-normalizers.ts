type ListResponse<Key extends string, Item> = {
  total?: number;
} & Partial<Record<Key, Item[]>>;

export function withDefaultListTotal<
  const Key extends string,
  Item,
  Result extends ListResponse<Key, Item>,
>(
  result: Result,
  key: Key,
): Result & Record<Key, Item[]> & { total: number } {
  const values = result[key] ?? [];
  return {
    ...result,
    [key]: values,
    total: result.total ?? values.length,
  } as Result & Record<Key, Item[]> & { total: number };
}
