/** Fortune-table paging: 大运 shows eight on its first page, 流月 nine; later pages start at the fourth item. */
const PAGE_SIZE = 9;
const NEXT_PAGE_START = 3;

function pageItems<T>(items: readonly T[], page: number, firstPageSize: number): T[] {
	if (page === 0) return items.slice(0, firstPageSize);
	return items.slice(NEXT_PAGE_START, NEXT_PAGE_START + PAGE_SIZE);
}

export function buildBaziDayunPageItems<T>(items: readonly T[], page: number): T[] {
	return pageItems(items, page, 8);
}

export function buildBaziLiuyuePageItems<T>(items: readonly T[], page: number): T[] {
	return pageItems(items, page, PAGE_SIZE);
}
