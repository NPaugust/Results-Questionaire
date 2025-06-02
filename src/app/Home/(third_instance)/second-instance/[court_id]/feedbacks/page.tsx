import RemarksPage from "@/lib/utils/remarksLogic/RemarksLogic";

function page() {

  return (
    <div><RemarksPage /></div>
  );
}

export function generateStaticParams() {
  const ids = Array.from({ length: 75 }, (_, index) => (index + 1).toString()); 

  return ids.map((id) => ({
    id: id,
  }));
}

export default page;
