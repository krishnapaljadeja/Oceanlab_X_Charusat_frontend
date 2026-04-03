import { ContinuousPagination } from "./continuous-pagination";

export default function ContinuousPaginationDemo() {
  return (
    <div className="flex items-center justify-center">
      <ContinuousPagination totalPages={5} defaultPage={2} />
    </div>
  );
}
