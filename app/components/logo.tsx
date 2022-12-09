export function Logo(props: { className?: string }) {
  const { className } = props;

  return (
    <svg
      viewBox="0 0 34 34"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M32.964 32.964V16.982C32.964 8.15 25.814 1 16.982 1 8.15 1 1 8.15 1 16.982c0 8.832 7.15 15.982 15.982 15.982h15.982Zm-5.335-4.976H17.106A10.518 10.518 0 0 1 6.583 17.465 10.518 10.518 0 0 1 17.106 6.943a10.518 10.518 0 0 1 10.523 10.522v10.523Z" />
      <circle cx="14" cy="14" r="3" />
      <circle cx="21" cy="14" r="3" />
      <circle cx="21" cy="21" r="3" />
      <circle cx="14" cy="21" r="3" />
    </svg>
  );
}
