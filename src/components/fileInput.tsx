interface FileData { id?: string; file?: File; url: string };

function defaultRenderItem ({ url }: FileData){
  /** Splits filenames from url (remote or local) */
  function getFileName(url?: string){
    if (!url) return "";
    return url.split("/").pop() ?? url;
  };

  return (
    <button className="btn btn-link">
      <a href={url} className="link" target="_blank" rel="noreferrer">
        {getFileName(url)}
      </a>
    </button>
  )
}

/**
 * Styled Extensible File Input
 */
export const FileInput = ({
  data,
  renderItem = defaultRenderItem,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  data?: FileData[];
  renderItem: (args: FileData) => React.ReactNode
}) => {
  return (
    <div className="form-control max-w-xs gap-2">
      <div className="dropdown">
        <label
          tabIndex={0}
          className={`btn ${
            data === undefined ||
            data.length === 0
            ? 'btn-disabled'
            : ''
          }`}
        >
          Fotos Selecionadas
        </label>
        <ul tabIndex={0} className="dropdown-content shadow bg-base-100 rounded-box w-max p-2">
          {data?.map((photo) => (
            <li key={photo.url}>
              {renderItem(photo)}
            </li>
          ))}
        </ul>
      </div>
      <input type="file" {...props} />
    </div>
  );
};

