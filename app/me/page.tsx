"use client";
import MasterHoursCard from "../../components/MasterHoursCard";

export default function MePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">РњРѕР№ РїСЂРѕС„РёР»СЊ</h1>

      {/* Р‘Р»РѕРє С‡Р°СЃРѕРІ РёР· 1РЎ */}
      <MasterHoursCard />

      {/* Р·РґРµСЃСЊ РјРѕР¶РµС€СЊ РґРѕР±Р°РІРёС‚СЊ РґСЂСѓРіРёРµ РєР°СЂС‚РѕС‡РєРё РїСЂРѕС„РёР»СЏ */}
    </main>
  );
}


