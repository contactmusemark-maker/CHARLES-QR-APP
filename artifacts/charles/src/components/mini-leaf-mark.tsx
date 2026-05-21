export function MiniLeafMark(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={props.className}
      fill="none"
    >
      <path
        d="M30.9 10.8c-7.5 1.1-13.4 7-14.5 14.5-.6 4.2.5 7.8 2.7 10.4 2.6-2.1 6.2-3.3 10.4-2.7 7.5-1.1 13.4-7 14.5-14.5.6-4.2-.5-7.8-2.7-10.4-2.6 2.1-6.2 3.3-10.4 2.7Z"
        className="fill-[#4a7c59]/12"
      />
      <path
        d="M14.8 33.2c8.1-8.1 17.3-13 26.8-14.7"
        stroke="#4a7c59"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14.8 33.2c2.3-6.2 6.1-12 11.4-17.2"
        stroke="#4a7c59"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

