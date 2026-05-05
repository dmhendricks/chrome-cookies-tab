interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function FilterBar({ value, onChange }: Props) {
  return (
    <div id="filter-bar">
      <input
        type="search"
        className="filter-input"
        placeholder="Filter by name"
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  );
}
