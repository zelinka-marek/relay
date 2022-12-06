import { XCircleIcon } from "@heroicons/react/20/solid";

export function Alert(props: { title: string; children?: string }) {
  const { title, children } = props;

  return (
    <div className="flex gap-3 rounded-md bg-red-50 p-4">
      <XCircleIcon className="h-5 w-5 shrink-0 text-red-400" />
      <div className="space-y-2 ">
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
        {children && (
          <div className="max-w-prose text-sm text-red-700">{children}</div>
        )}
      </div>
    </div>
  );
}
