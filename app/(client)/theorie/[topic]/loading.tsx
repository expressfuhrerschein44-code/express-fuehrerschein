export default function TheoryTopicLoading() {
  return (
    <div className="mx-auto w-full max-w-[1180px] animate-pulse px-3 py-5 sm:px-4 lg:px-7 lg:py-7">
      <div className="h-4 w-28 rounded bg-[#E9EEF5]" />

      <div className="mt-4 rounded-[20px] border border-[#E5EAF2] bg-white p-6">
        <div className="h-5 w-36 rounded bg-[#E9EEF5]" />
        <div className="mt-4 h-8 w-2/3 rounded bg-[#E9EEF5]" />
        <div className="mt-3 h-4 w-full max-w-[620px] rounded bg-[#EEF2F7]" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-4">
          <div className="h-72 rounded-[18px] border border-[#E5EAF2] bg-white" />
          <div className="h-96 rounded-[18px] border border-[#E5EAF2] bg-white" />
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-[18px] border border-[#E5EAF2] bg-white" />
          <div className="h-56 rounded-[18px] border border-[#E5EAF2] bg-white" />
        </div>
      </div>
    </div>
  );
}
