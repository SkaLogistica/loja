export const PaginationButtonGroup: React.FC<{
  page: number
  disableNext: boolean
  dispatcher: React.Dispatch<React.SetStateAction<number>>
}> = ({ page, disableNext, dispatcher }) => {
  const previousPageCB = () => dispatcher((old) => Math.max(0, old - 1))
  const nextPageCB = () => dispatcher((old) => old + 1)

  const CaretLeftIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="192"
      height="192"
      fill="#000000"
      viewBox="0 0 256 256"
      className={className}
    >
      <rect width="256" height="256" fill="none"></rect>
      <polyline
        points="160 208 80 128 160 48"
        fill="none"
        stroke="#000000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      ></polyline>
    </svg>
  )

  const CaretRightIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="192"
      height="192"
      fill="#000000"
      viewBox="0 0 256 256"
      className={className}
    >
      <rect width="256" height="256" fill="none"></rect>
      <polyline
        points="96 48 176 128 96 208"
        fill="none"
        stroke="#000000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      ></polyline>
    </svg>
  )

  return (
    <div className="btn-group grid grid-cols-3">
      <button
        className="btn btn-ghost"
        disabled={!page}
        onClick={previousPageCB}
      >
        <CaretLeftIcon className="h-4 w-4" />
      </button>
      <div className="flex cursor-not-allowed items-center justify-center bg-primary/30">
        {page + 1}
      </div>
      <button
        className="btn btn-ghost"
        disabled={disableNext}
        onClick={nextPageCB}
      >
        <CaretRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
