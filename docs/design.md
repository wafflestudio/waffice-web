# Design Component Guide

이 문서는 WAFFICE Figma 디자인을 코드로 옮길 때 재사용해야 할 공통 컴포넌트와 아직 공통화할 후보를 정리한다. Codex, Claude 등 AI 에이전트는 새 UI를 만들기 전에 이 문서를 먼저 확인한다.

## Figma References

- Calendar: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=154-7979&m=dev
- Dropdown menu: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=390-15361&m=dev
- Dropdown box: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=390-15313&m=dev
- Pagination: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=390-15258&m=dev
- Search input states: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=150-7325&m=dev
- Confirm/cancel buttons: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=149-7210&m=dev
- Filter dropdown guide: https://www.figma.com/design/pIAwv26zdIypnuQG3lAFE7/WAFFICE_%EA%B3%B5%EA%B0%9C?node-id=151-7465&m=dev

## Design Tokens

Use Tailwind tokens from `src/app/globals.css`; avoid raw hex values unless the token is missing.

```txt
white      #FFFFFF  -> bg-white / text-white
black-100  #F7F7F7  -> table row hover, subtle button hover
black-300  #DBDFE0  -> borders
black-400  #B4B4B4  -> placeholder/icon disabled-ish gray
black-500  #999999  -> checkbox border, secondary gray text
black-600  #777777  -> dropdown default text
black-700  #505050  -> form secondary text
black-900  #121212  -> primary text
peach-100  #FDF1EF  -> selected/filter tag background, dropdown hover
peach-300  #F77153  -> primary button, focus border
peach-500  #E75010  -> selected text, primary button hover
```

## Existing Components To Reuse

### SearchInput

File: `src/components/ui/search-input.tsx`

Use for member/project search bars instead of custom search markup.

Base behavior:

- wrapper: `h-[40px]`, `rounded-[3px]`, `border-black-300`, `bg-white`
- hover/focus: `hover:border-peach-300`, `focus-within:border-peach-300`
- icon: `Search`, `size-[20px]`, `text-black-400`
- text: `text-[13px]`, `leading-[1.4]`, `tracking-[-0.26px]`

Example:

```tsx
<SearchInput
  containerClassName="h-[36px] w-[260px]"
  placeholder="검색어를 입력해 주세요"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
/>
```

### Dropdown Menu Items

File: `src/components/ui/dropdown-menu.tsx`

Use `DropdownMenuFilterRadioItem` for Figma filter/select menus.

Item state guide:

- default: `text-black-600`, `bg-white`
- hover/highlight: `bg-peach-100`
- checked: `text-peach-500`, `bg-white`, check icon visible
- size: `h-[40px]`, `rounded-[3px]`, `px-[8px]`, `py-[6px]`

Use `DropdownMenuFilterCheckboxItem` for multi-select filters such as access rights. If a new checkbox filter is added, update this component first instead of duplicating checkbox SVG markup in domain code.

### SelectField

File: `src/components/ui/select-field.tsx`

Use for Figma-style dropdown box fields, especially form rows like role, enrollment status, project status.

Default control:

- trigger: `h-[50px] w-[360px]`, `rounded-[5px]`, `border-black-300`
- focus: `focus-visible:border-peach-300`
- content: `w-[360px]`, `rounded-[5px]`, `border-black-300`
- items: `h-[50px]`, `px-[16px]`, `text-[15px]`

Example:

```tsx
<SelectField
  label="재학여부"
  value={affiliation}
  options={["학부생", "대학원생", "졸업생"]}
  onChange={setAffiliation}
/>
```

When the design needs a compact table filter, use `DropdownMenu` directly with `DropdownMenuFilterRadioItem` instead of forcing `SelectField`.

### Calendar / CalendarDateField

File: `src/components/ui/calendar.tsx`

Use `CalendarDateField` for date input buttons and `Calendar` for standalone calendar popovers.

Important behavior:

- `CalendarDateField` supports both uncontrolled and controlled open state.
- If several date fields appear together, keep one `openCalendarKey` in the parent and pass `open` / `onOpenChange` so only one calendar opens at a time.
- Calendar year/month selectors reuse `DropdownMenuFilterRadioItem`.

Example:

```tsx
<CalendarDateField
  value={startDate}
  onChange={setStartDate}
  open={openCalendarKey === "start"}
  onOpenChange={(open) => setOpenCalendarKey(open ? "start" : null)}
/>
```

### Pagination

File: `src/components/ui/pagination.tsx`

Use for all table pagination. Do not reimplement arrow/page-number controls in domain tables.

Base behavior:

- page numbers: `text-[17px]`, active `text-peach-300`
- inactive: `text-black-400`, `hover:text-black-600`
- icons: first/prev/next/last, disabled `text-black-300`

Example:

```tsx
<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
```

### DialogActionButton

File: `src/components/ui/dialog-action-button.tsx`

Use for modal confirm/cancel actions instead of repeating fixed button classes.

```tsx
<DialogActionButton variant="cancel">취소</DialogActionButton>
<DialogActionButton>확인</DialogActionButton>
<DialogActionButton size="sm">확인</DialogActionButton>
```

Variants:

- `confirm`: peach primary action
- `cancel`: white bordered cancel action
- `danger`: light red destructive action

Sizes:

- `default`: `h-[50px] w-[121px]`
- `sm`: `h-[40px] px-[30px]`

### DesignDialogContent

File: `src/components/ui/design-dialog.tsx`

Use when a Figma modal needs the project close-button pattern and custom content frame.

```tsx
<DesignDialogContent
  className="w-[460px] max-w-[460px] rounded-[12px] border border-black-300"
  showDesignClose
  onClose={onClose}
>
  ...
</DesignDialogContent>
```

Rules:

- Prefer `showDesignClose` over hand-placing close buttons.
- Keep close button inside the white modal box.
- Override shadcn width constraints with `!w-[...]` / `!max-w-[...]` only for large exact-width designs.

### FilterTag / FilterTrigger

File: `src/components/ui/filter-tag.tsx`

Use for active filter chips, reset links, and table header filter triggers.

```tsx
<FilterTagGroup>
  <FilterTag label="활동 중" onClick={clearFilter} />
  <FilterResetButton onClick={resetFilters}>초기화</FilterResetButton>
</FilterTagGroup>

<FilterTrigger aria-label="활동 상태 필터" />
<FilterTrigger className="h-auto w-auto gap-[6px]" iconClassName="size-4">
  자격
</FilterTrigger>
```

### DesignTable Primitives

File: `src/components/ui/design-table.tsx`

Use for Figma-style custom tables that are not comfortably covered by the shadcn `Table` defaults.

```tsx
<DesignTable>
  <thead>
    <DesignTableHeaderRow>
      <DesignTableHeaderCell>이름</DesignTableHeaderCell>
    </DesignTableHeaderRow>
  </thead>
  <tbody>
    <DesignTableRow>
      <DesignTableBodyCell>김와플</DesignTableBodyCell>
    </DesignTableRow>
  </tbody>
</DesignTable>
```

### Status Badges

File: `src/components/ui/status-badge.tsx`

Use `DotStatusBadge` for dot + text statuses and `TagBadge` for compact labels such as `팀장`.

```tsx
<DotStatusBadge dotClassName="bg-[#7aee7f]">활성화</DotStatusBadge>
<TagBadge>팀장</TagBadge>
```

## Remaining Commonization Candidates

These patterns are repeated today and should be extracted before adding more screens.

### Confirm / Cancel Buttons

Already implemented as `DialogActionButton`. New modal buttons should use it. If a remaining screen has hand-written confirm/cancel classes, replace them before adding new variants.

### Dialog Frame

Several Figma modals use the same frame pattern.

Implemented as `DesignDialogContent`; continue replacing remaining raw `DialogContent` frames when touching those screens.

Recommended API:

```tsx
<DesignDialogContent width={460} radius={12} onClose={onClose}>
  ...
</DesignDialogContent>
```

Class guide:

- `showCloseButton={false}` on `DialogContent`
- close button inside content using `ml-auto`, not absolute outside the box
- modal content: `bg-white`, `p-0` or controlled fixed padding
- common shadow: `shadow-[0_4px_16px_rgba(0,0,0,0.12)]` when the design calls for elevation
- radius: `rounded-[12px]` or `rounded-[15px]` by Figma frame

Avoid relying on shadcn's default `sm:max-w-lg` when Figma defines exact modal width. Use `!w-[...]` / `!max-w-[...]` only when the base max-width must be overridden.

### Filter Tag

Implemented as `FilterTag`, `FilterResetButton`, and `FilterTagGroup`.

Recommended API:

```tsx
<FilterTag label="활동 중" onRemove={clearActivityFilter} />
<FilterResetButton onClick={resetFilters} />
```

Class guide:

- tag: `h-[33px]`, `rounded-[3px]`, `bg-peach-100`, `text-peach-500`
- remove icon: `X`, `size-[9px]`
- reset: `text-peach-500 underline underline-offset-[2px]`

### Filter Trigger

Implemented as `FilterTrigger`.

Recommended API:

```tsx
<FilterTrigger aria-label="활동 상태 필터" />
```

Class guide:

- `Settings2` icon
- compact table trigger: `size-[16px]`, icon `size-[12px]`
- hover: subtle neutral hover such as `hover:bg-black-300/40`

### Table Primitives

Implemented as `DesignTable` primitives for Figma-specific tables. Existing shadcn `Table` usage may stay when it already matches the design.

Recommended components:

```tsx
<DesignTable>
<DesignTableHeaderCell>
<DesignTableBodyCell>
```

Class guide:

- table uses `table-fixed`
- cells should use `whitespace-nowrap`
- long text cells use `truncate`
- row hover: `hover:bg-black-100`
- header bg: `bg-black-100`
- border: `border-black-300`

Do not allow table labels to wrap to two lines unless the Figma design explicitly says so.

### Status Badge

Project status, activity status, member role tags, and leader tags share badge behavior.

Recommended API:

```tsx
<StatusBadge tone="green">활성화</StatusBadge>
<StatusBadge tone="gray">비활성화</StatusBadge>
<TagBadge tone="peach">팀장</TagBadge>
```

Keep domain-to-color mapping in the domain layer, but centralize badge layout classes.

## Button State Rules

Use these states unless the Figma node says otherwise.

```txt
primary action:
bg-peach-300 hover:bg-peach-500 active:bg-peach-500 text-white

secondary/cancel:
bg-white border-black-300 hover:bg-black-300 active:bg-black-300 text-black-900

neutral ghost/table icon:
text-black-800 hover:bg-black-100

danger:
bg-[#ffeaea] text-[#f44949] hover:bg-[#ffdada]
```

Do not create new hover colors per screen. If a required color is missing, add it to `globals.css` first.

## Implementation Checklist

Before adding a new UI component:

1. Check whether `SearchInput`, `SelectField`, `CalendarDateField`, `Pagination`, or dropdown filter items already cover it.
2. If a class pattern appears in 2 or more files, extract a small UI component or variant.
3. Prefer Figma token names mapped through `globals.css`.
4. Keep stateful primitives controlled when several instances can be open at once.
5. Run:

```bash
pnpm run format:check
pnpm run lint
pnpm run build
```
