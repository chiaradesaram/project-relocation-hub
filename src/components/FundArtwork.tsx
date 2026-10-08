import artwork from "@/assets/fund-icon-atlas.jpg";

const positions = ["fund-art-0", "fund-art-1", "fund-art-2", "fund-art-3", "fund-art-4", "fund-art-5"];
export function FundArtwork({ index, large = false }: { index: number; large?: boolean }) {
  return <span aria-hidden="true" className={`fund-art relative block shrink-0 overflow-hidden rounded-xl ${large ? "h-20 w-20" : "h-12 w-12"} ${positions[index] ?? positions[0]}`}><img src={artwork} width={1536} height={1024} loading="lazy" alt="" className="absolute max-w-none" /></span>;
}