export default function LoadMorePageComponent({
                                                  pagination,
                                                  loadMoreText,
                                                  lastPageText = '已是最後一頁',
                                                  loadingText = '讀取中...',
                                                  reference
                                              }) {
    return (
        <button
            className="mt-2 text-emerald-400 w-40 border-2 border-emerald-400 rounded-lg cursor-pointer hover:bg-emerald-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            ref={reference}
            style={{borderColor: "#00C889", borderStyle: "solid"}}
            disabled={!pagination.hasNextPage}
            onClick={() => {
                pagination.fetchNextPage()
            }}>{!pagination.hasNextPage
            ? lastPageText
            : pagination.isFetching
                ? loadingText
                : loadMoreText}
        </button>
    )
}