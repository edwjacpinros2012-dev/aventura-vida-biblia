import type { CustomAvatarConfig } from "@/lib/characters/custom-avatar";
import { customAvatarOption } from "@/lib/characters/custom-avatar";

type CustomCharacterAvatarProps = {
  config: CustomAvatarConfig;
  alt: string;
  className?: string;
  variant?: "avatar" | "full";
};

/** Avatar de capas CSS: no acepta archivos, URL ni texto del jugador. */
export function CustomCharacterAvatar({ config, alt, className = "", variant = "avatar" }: CustomCharacterAvatarProps) {
  const skin = customAvatarOption("skinTone", config.skinTone);
  const hair = customAvatarOption("hairColor", config.hairColor);
  const eyes = customAvatarOption("eyeColor", config.eyeColor);
  const clothes = customAvatarOption("outfitColor", config.outfitColor);
  const isLongHair = config.hairStyle === "largo";
  const isCurlyHair = config.hairStyle === "rizado";
  const isHoodie = config.outfit === "sudadera";
  const isDress = config.outfit === "vestido";

  return <span role="img" aria-label={alt} className={`relative isolate block overflow-hidden ${className}`}>
    <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(145deg,#dff7ff_0%,#f8edff_100%)]" />
    <span aria-hidden="true" className="absolute bottom-[-5%] left-1/2 h-[47%] w-[58%] -translate-x-1/2 rounded-t-[44%]" style={{ backgroundColor: clothes.color }} />
    {isDress && <span aria-hidden="true" className="absolute bottom-[-8%] left-1/2 h-[39%] w-[78%] -translate-x-1/2 rounded-t-[38%]" style={{ backgroundColor: clothes.color }} />}
    {isHoodie && <span aria-hidden="true" className="absolute bottom-[30%] left-1/2 h-[22%] w-[42%] -translate-x-1/2 rounded-t-[48%] border-2 border-white/35" style={{ backgroundColor: hair.color }} />}
    {variant === "full" && <><span aria-hidden="true" className="absolute bottom-[-8%] left-[31%] h-[25%] w-[16%] rounded-t-full" style={{ backgroundColor: skin.color }} /><span aria-hidden="true" className="absolute bottom-[-8%] right-[31%] h-[25%] w-[16%] rounded-t-full" style={{ backgroundColor: skin.color }} /></>}
    {isLongHair && <span aria-hidden="true" className="absolute left-[20%] top-[15%] h-[48%] w-[60%] rounded-[42%]" style={{ backgroundColor: hair.color }} />}
    <span aria-hidden="true" className="absolute left-1/2 top-[16%] h-[45%] w-[50%] -translate-x-1/2 rounded-[47%]" style={{ backgroundColor: skin.color }} />
    <span aria-hidden="true" className={`absolute left-1/2 top-[10%] h-[26%] w-[54%] -translate-x-1/2 ${isCurlyHair ? "rounded-[46%]" : config.hairStyle === "ondas" ? "rounded-t-[48%] rounded-b-[28%]" : "rounded-t-[50%] rounded-b-[18%]"}`} style={{ backgroundColor: hair.color }} />
    {isCurlyHair && <><span aria-hidden="true" className="absolute left-[21%] top-[14%] h-[18%] w-[18%] rounded-full" style={{ backgroundColor: hair.color }} /><span aria-hidden="true" className="absolute right-[21%] top-[14%] h-[18%] w-[18%] rounded-full" style={{ backgroundColor: hair.color }} /></>}
    <span aria-hidden="true" className="absolute left-[36%] top-[35%] h-[6%] w-[6%] rounded-full" style={{ backgroundColor: eyes.color }} /><span aria-hidden="true" className="absolute right-[36%] top-[35%] h-[6%] w-[6%] rounded-full" style={{ backgroundColor: eyes.color }} />
    <span aria-hidden="true" className="absolute left-1/2 top-[48%] h-[4%] w-[17%] -translate-x-1/2 rounded-full bg-[#bd6d69]/70" />
    {config.accessory === "gafas" && <><span aria-hidden="true" className="absolute left-[29%] top-[31%] h-[15%] w-[18%] rounded-full border-2 border-ink/80" /><span aria-hidden="true" className="absolute right-[29%] top-[31%] h-[15%] w-[18%] rounded-full border-2 border-ink/80" /><span aria-hidden="true" className="absolute left-[47%] top-[37%] h-[2%] w-[8%] bg-ink/80" /></>}
    {config.accessory === "estrella" && <span aria-hidden="true" className="absolute right-[12%] top-[8%] text-[40%] text-sun">✦</span>}
    {config.accessory === "paloma" && <span aria-hidden="true" className="absolute right-[9%] top-[7%] text-[36%]">🕊</span>}
  </span>;
}
