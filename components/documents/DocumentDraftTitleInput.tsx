type DocumentDraftTitleInputProps = {
  onTitleChange: (title: string) => void;
  placeholder: string;
  title: string;
};

export function DocumentDraftTitleInput({
  onTitleChange,
  placeholder,
  title,
}: DocumentDraftTitleInputProps) {
  return (
    <div>
      <label className="sr-only" htmlFor="document-title">
        Document title
      </label>
      <input
        className="w-full border-b border-transparent bg-transparent pb-2 font-[Georgia,serif] text-4xl font-normal leading-tight tracking-normal text-[#1a1c1b] outline-none transition-colors placeholder:text-[#c3c8c0] hover:border-[#e3e2e0] focus:border-[#506051] md:text-5xl md:leading-[56px]"
        id="document-title"
        maxLength={120}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={title}
      />
    </div>
  );
}
