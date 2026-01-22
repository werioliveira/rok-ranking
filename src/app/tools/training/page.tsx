'use client';
import React, { useState, useMemo } from 'react';
import { RotateCcw, Shield, Swords, Hammer, Trophy, Target, ArrowUpRight, Clock, Star, Coins } from 'lucide-react';

// --- TYPES ---
type Tier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
type UnitType = 'infantry' | 'archer' | 'cavalry' | 'siege';
type Tab = 'train' | 'upgrade' | 'inventory' | 'goal';

interface Stats {
  time: number;
  mge: number;
  power: number;
  kvk: number;
}

interface Resources {
  food: number;
  wood: number;
  stone: number;
  gold: number;
}

// --- CONSTANTS ---
const BASE_STATS: Record<Tier, Stats> = {
  T5: { time: 120, mge: 80, power: 10, kvk: 20 }, // kvk 20 ok
  T4: { time: 80,  mge: 32,  power: 4,  kvk: 8 },  // kvk 8 ok
  T3: { time: 60,  mge: 16,  power: 3,  kvk: 4 },  // kvk 4 ok
  T2: { time: 30,  mge: 8,  power: 2,  kvk: 2 },  
  T1: { time: 15,  mge: 4,   power: 1,  kvk: 1 },  // kvk 1 ok
};

const UPGRADE_OFFSETS: Partial<Record<Tier, Stats>> = {
  T4: { time: 80, mge: 32, power: 4, kvk: 8 }, // mge alterado para 32
  T3: { time: 60, mge: 16, power: 3, kvk: 4 }, // mge alterado para 16
  T2: { time: 30, mge: 8,  power: 2, kvk: 2 }, // mge alterado para 8
  T1: { time: 15, mge: 4,  power: 1, kvk: 1 }, // mge alterado para 4
};

const UNIT_COSTS: Record<Tier, Record<UnitType, Resources>> = {
  T5: { infantry: { food: 800, wood: 800, stone: 0, gold: 400 }, archer: { food: 0, wood: 800, stone: 600, gold: 400 }, cavalry: { food: 800, wood: 0, stone: 600, gold: 400 }, siege: { food: 500, wood: 500, stone: 400, gold: 400 } },
  T4: { infantry: { food: 300, wood: 300, stone: 0, gold: 20 }, archer: { food: 0, wood: 300, stone: 225, gold: 20 }, cavalry: { food: 300, wood: 0, stone: 225, gold: 20 }, siege: { food: 200, wood: 200, stone: 150, gold: 20 } },
  T3: { infantry: { food: 150, wood: 150, stone: 0, gold: 10 }, archer: { food: 0, wood: 150, stone: 112, gold: 10 }, cavalry: { food: 150, wood: 0, stone: 112, gold: 10 }, siege: { food: 100, wood: 100, stone: 75, gold: 10 } },
  T2: { infantry: { food: 100, wood: 100, stone: 0, gold: 0 }, archer: { food: 0, wood: 100, stone: 75, gold: 0 }, cavalry: { food: 100, wood: 0, stone: 75, gold: 0 }, siege: { food: 65, wood: 65, stone: 50, gold: 0 } },
  T1: { infantry: { food: 50, wood: 50, stone: 0, gold: 0 }, archer: { food: 40, wood: 60, stone: 0, gold: 0 }, cavalry: { food: 60, wood: 40, stone: 0, gold: 0 }, siege: { food: 60, wood: 60, stone: 0, gold: 0 } }
};

const formatFull = (n: number) => Math.floor(n).toLocaleString('en-US');

export default function RokUltimateCalc() {
  const [speedBonus, setSpeedBonus] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [activeTier, setActiveTier] = useState<Tier>('T4');

  const [targetMge, setTargetMge] = useState(0);
  const [invDays, setInvDays] = useState(0);
  const [invHours, setInvHours] = useState(0);
  const [invMins, setInvMins] = useState(0);
  const [invTarget, setInvTarget] = useState<Tier>('T4');
  const [invFrom, setInvFrom] = useState<Tier>('T3');
  const [invType, setInvType] = useState<UnitType>('infantry');
  const [invMode, setInvMode] = useState<'direct' | 'upgrade'>('direct');

  const [trainData, setTrainData] = useState<Record<Tier, Record<UnitType, number>>>({ T1: { infantry: 0, cavalry: 0, archer: 0, siege: 0 }, T2: { infantry: 0, cavalry: 0, archer: 0, siege: 0 }, T3: { infantry: 0, cavalry: 0, archer: 0, siege: 0 }, T4: { infantry: 0, cavalry: 0, archer: 0, siege: 0 }, T5: { infantry: 0, cavalry: 0, archer: 0, siege: 0 } });
  const [upgradeData, setUpgradeData] = useState<{ from: Tier; to: Tier } & Record<UnitType, number>>({ from: 'T4', to: 'T5', infantry: 0, cavalry: 0, archer: 0, siege: 0 });

  const goalPlan = useMemo(() => {
    if (activeTab !== 'goal' || targetMge <= 0) return null;
    const speedFactor = 1 + (speedBonus / 100);
    let ptsPerUnit = 0;
    let kvkPerUnit = 0;
    let pwrPerUnit = 0;
    
    if (invMode === 'direct') {
      ptsPerUnit = BASE_STATS[invTarget].mge;
      kvkPerUnit = BASE_STATS[invTarget].kvk;
      pwrPerUnit = BASE_STATS[invTarget].power;
    } else {
      if (parseInt(invFrom[1]) >= parseInt(invTarget[1])) return "INVALID";
      const off = UPGRADE_OFFSETS[invFrom];
      if (!off) return "INVALID";
      const target = BASE_STATS[invTarget];
      ptsPerUnit = target.mge - off.mge;
      kvkPerUnit = target.kvk - off.kvk;
      pwrPerUnit = target.power - off.power;
    }

    const unitsNeeded = Math.ceil(targetMge / ptsPerUnit);
    let dTime = invMode === 'direct' ? BASE_STATS[invTarget].time : (BASE_STATS[invTarget].time - (UPGRADE_OFFSETS[invFrom]?.time || 0));
    if (invMode === 'upgrade' && invTarget === 'T5') {
       if (invFrom === 'T1') dTime = 115;
       if (invFrom === 'T2') dTime = 80;
    }

    const cTo = UNIT_COSTS[invTarget][invType];
    const cFrom = invMode === 'upgrade' ? UNIT_COSTS[invFrom][invType] : { food: 0, wood: 0, stone: 0, gold: 0 };

    return {
      units: unitsNeeded,
      totalTime: (unitsNeeded * dTime) / speedFactor,
      kvk: unitsNeeded * kvkPerUnit,
      power: unitsNeeded * pwrPerUnit,
      res: {
        food: unitsNeeded * (cTo.food - cFrom.food),
        wood: unitsNeeded * (cTo.wood - cFrom.wood),
        stone: unitsNeeded * (cTo.stone - cFrom.stone),
        gold: unitsNeeded * (cTo.gold - cFrom.gold)
      }
    };
  }, [targetMge, invTarget, invFrom, invMode, invType, speedBonus, activeTab]);

  const results = useMemo(() => {
    let totals = { time: 0, power: 0, mge: 0, kvk: 0, food: 0, wood: 0, stone: 0, gold: 0 };
    const speedFactor = 1 + (speedBonus / 100);
    if (activeTab === 'train') {
      (Object.keys(trainData) as Tier[]).forEach(tier => {
        (Object.keys(trainData[tier]) as UnitType[]).forEach(type => {
          const qty = trainData[tier][type]; if (qty <= 0) return;
          const s = BASE_STATS[tier];
          totals.time += (s.time * qty) / speedFactor;
          totals.mge += s.mge * qty; totals.power += s.power * qty; totals.kvk += s.kvk * qty;
          const c = UNIT_COSTS[tier][type];
          totals.food += c.food * qty; totals.wood += c.wood * qty; totals.stone += c.stone * qty; totals.gold += c.gold * qty;
        });
      });
    } else if (activeTab === 'upgrade') {
      const { from, to } = upgradeData;
      const types: UnitType[] = ['infantry', 'cavalry', 'archer', 'siege'];
      types.forEach(type => {
        const qty = upgradeData[type]; if (qty <= 0) return;
        const off = UPGRADE_OFFSETS[from]; const target = BASE_STATS[to];
        if (!off) return;
        let dTime = target.time - off.time; let dMge = target.mge - off.mge; let dKvk = target.kvk - off.kvk;
        //if (to === 'T5') { if (from === 'T1') { dTime = 115; dMge = 95; dKvk = 19; } if (from === 'T2') { dTime = 80; dMge = 90; dKvk = 18; } }
        totals.time += (dTime * qty) / speedFactor; totals.mge += dMge * qty; totals.power += (target.power - off.power) * qty; totals.kvk += dKvk * qty;
        const cTo = UNIT_COSTS[to][type]; const cFrom = UNIT_COSTS[from][type];
        totals.food += (cTo.food - cFrom.food) * qty; totals.wood += (cTo.wood - cFrom.wood) * qty; totals.stone += (cTo.stone - cFrom.stone) * qty; totals.gold += (cTo.gold - cFrom.gold) * qty;
      });
    }
    return totals;
  }, [trainData, upgradeData, speedBonus, activeTab]);

  const inventoryPlan = useMemo(() => {
    const totalSec = (invDays * 86400) + (invHours * 3600) + (invMins * 60);
    if (totalSec <= 0 || activeTab !== 'inventory') return null;
    const speedFactor = 1 + (speedBonus / 100);
    let uTime = 0, uMge = 0, uKvk = 0, uPower = 0, uRes = { food: 0, wood: 0, stone: 0, gold: 0 };
    if (invMode === 'direct') {
      const s = BASE_STATS[invTarget]; uTime = s.time / speedFactor; uMge = s.mge; uKvk = s.kvk; uPower = s.power; uRes = UNIT_COSTS[invTarget][invType];
    } else {
      if (parseInt(invFrom[1]) >= parseInt(invTarget[1])) return "INVALID";
      const off = UPGRADE_OFFSETS[invFrom]; const target = BASE_STATS[invTarget];
      if (!off) return "INVALID";
      let dTime = target.time - off.time; let dMge = target.mge - off.mge;
      //if (invTarget === 'T5' && invFrom === 'T1') { dTime = 115; dMge = 95; }
     // if (invTarget === 'T5' && invFrom === 'T2') { dTime = 80; dMge = 90; }
      uTime = dTime / speedFactor; uMge = dMge; uKvk = target.kvk - off.kvk; uPower = target.power - off.power;
      const cTo = UNIT_COSTS[invTarget][invType]; const cFrom = UNIT_COSTS[invFrom][invType];
      uRes = { food: cTo.food - cFrom.food, wood: cTo.wood - cFrom.wood, stone: cTo.stone - cFrom.stone, gold: cTo.gold - cFrom.gold };
    }
    const units = Math.floor(totalSec / uTime);
    return { units, mge: units * uMge, kvk: units * uKvk, power: units * uPower, res: { food: units * uRes.food, wood: units * uRes.wood, stone: units * uRes.stone, gold: units * uRes.gold } };
  }, [invDays, invHours, invMins, invTarget, invFrom, invType, invMode, speedBonus, activeTab]);

  const formatTime = (s: number) => {
    const d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), sec=Math.round(s%60);
    return `${d>0?d+'d ':''}${h>0?h+'h ':''}${m>0?m+'m ':''}${sec}s`;
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-[#16181d] p-6 rounded-3xl border border-gray-800 shadow-xl">
            <h1 className="text-2xl font-black text-white italic">ROK<span className="text-yellow-500">CALC</span></h1>
            <label className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-yellow-500/20 cursor-pointer">
              <span className="text-[10px] font-black text-gray-500 uppercase">Speed Bonus %</span>
              <input type="number" value={speedBonus === 0 ? '' : speedBonus} onChange={e=>setSpeedBonus(Number(e.target.value))} placeholder="0" className="bg-transparent text-yellow-500 font-bold w-12 text-right outline-none"/>
            </label>
          </div>

          <div className="flex bg-[#16181d] p-1.5 rounded-2xl border border-gray-800 overflow-x-auto">
            {['train','upgrade','inventory','goal'].map((id) => (
              <button key={id} onClick={()=>setActiveTab(id as Tab)} className={`flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black transition-all ${activeTab===id?'bg-gray-800 text-white shadow-lg':'text-gray-500'}`}>
                {id.toUpperCase().replace('_',' ')}
              </button>
            ))}
          </div>

          {activeTab === 'goal' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#16181d] p-8 rounded-[2.5rem] border border-gray-800 shadow-xl space-y-6">
                <div className="flex items-center gap-3 mb-2"><Star className="text-yellow-500" size={20}/><h3 className="text-sm font-black uppercase tracking-widest">MGE Goal Planner</h3></div>
                
                <div className="bg-black/40 p-6 rounded-2xl border border-gray-800 group focus-within:border-yellow-500/50 transition-all text-center relative">
                   <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Enter Target Points</p>
                    <input 
                      type="text" 
                      // O value exibe formatado, mas o estado interno é apenas número
                      value={targetMge === 0 ? '' : targetMge.toLocaleString('pt-BR')} 
                      onChange={e => {
                        // Remove tudo que não for dígito (pontos, vírgulas, espaços)
                        const rawValue = e.target.value.replace(/\D/g, '');
                        const numValue = Number(rawValue);
                        
                        // Define um limite razoável (ex: 2 bilhões) para evitar bugs de memória
                        if (numValue <= 2000000000) {
                          setTargetMge(numValue);
                        }
                      }}
                      className="bg-transparent w-full text-center text-4xl font-black text-white outline-none" 
                      placeholder="0"
                    />
                </div>

                <div className="pt-6 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SelectBox label="Unit Type" value={invType} onChange={(v) => setInvType(v as UnitType)} options={['infantry','archer','cavalry','siege']}/>
                    <SelectBox label="Method" value={invMode} onChange={(v) => setInvMode(v as 'direct' | 'upgrade')} options={[{v:'direct',l:'Direct Train'},{v:'upgrade',l:'Upgrade'}]}/>
                    {invMode === 'upgrade' ? (
                      <>
                        <SelectBox label="From Tier" value={invFrom} onChange={(v) => setInvFrom(v as Tier)} options={['T1','T2','T3','T4']}/>
                        <SelectBox label="To Tier" value={invTarget} onChange={(v) => setInvTarget(v as Tier)} options={['T2','T3','T4','T5']}/>
                      </>
                    ) : (
                      <div className="md:col-span-2"><SelectBox label="Train Tier" value={invTarget} onChange={(v) => setInvTarget(v as Tier)} options={['T1','T2','T3','T4','T5']}/></div>
                    )}
                </div>
              </div>

              {goalPlan && goalPlan !== "INVALID" && (
                <div className="bg-gradient-to-br from-yellow-600/10 to-transparent p-8 rounded-[2.5rem] border border-yellow-500/20 shadow-xl">
                  <div className="text-center mb-8">
                    <p className="text-[11px] font-black text-yellow-500 uppercase tracking-widest mb-2">Requirement for {targetMge.toLocaleString()} pts:</p>
                    <div className="text-6xl font-black text-white">{goalPlan.units.toLocaleString()}</div>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase">{invType} {invTarget} Units</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard label="Time Required" value={formatTime(goalPlan.totalTime)} icon={<Clock size={16} className="text-blue-400"/>}/>
                    <MetricCard label="KvK Points" value={formatFull(goalPlan.kvk)} icon={<Target size={16} className="text-red-500"/>}/>
                    <MetricCard label="Power Gain" value={formatFull(goalPlan.power)} icon={<Shield size={16} className="text-emerald-500"/>}/>
                  </div>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800/50">
                    <ResMini label="Food" value={formatFull(goalPlan.res.food)} color="text-green-500"/>
                    <ResMini label="Wood" value={formatFull(goalPlan.res.wood)} color="text-orange-500"/>
                    <ResMini label="Stone" value={formatFull(goalPlan.res.stone)} color="text-purple-500"/>
                    <ResMini label="Gold" value={formatFull(goalPlan.res.gold)} color="text-yellow-500"/>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ... Inventory, Train, Upgrade tabs stay consistent ... */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-[#16181d] p-8 rounded-[2.5rem] border border-gray-800 shadow-xl space-y-6">
                <div className="flex items-center gap-3 mb-2"><Clock className="text-blue-500" size={20}/><h3 className="text-sm font-black uppercase tracking-widest">Inventory Planner</h3></div>
                <div className="grid grid-cols-3 gap-4">
                  <InvInput label="Days" value={invDays} onChange={setInvDays}/>
                  <InvInput label="Hours" value={invHours} onChange={setInvHours}/>
                  <InvInput label="Minutes" value={invMins} onChange={setInvMins}/>
                </div>
                <div className="pt-6 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SelectBox label="Unit Type" value={invType} onChange={(v) => setInvType(v as UnitType)} options={['infantry','archer','cavalry','siege']}/>
                    <SelectBox label="Mode" value={invMode} onChange={(v) => setInvMode(v as 'direct' | 'upgrade')} options={[{v:'direct',l:'Direct Train'},{v:'upgrade',l:'Upgrade'}]}/>
                    {invMode === 'upgrade' ? (
                      <>
                        <SelectBox label="From Tier" value={invFrom} onChange={(v) => setInvFrom(v as Tier)} options={['T1','T2','T3','T4']}/>
                        <SelectBox label="To Tier" value={invTarget} onChange={(v) => setInvTarget(v as Tier)} options={['T2','T3','T4','T5']}/>
                      </>
                    ) : (
                      <div className="md:col-span-2"><SelectBox label="Train Tier" value={invTarget} onChange={(v) => setInvTarget(v as Tier)} options={['T1','T2','T3','T4','T5']}/></div>
                    )}
                </div>
              </div>
              {inventoryPlan && inventoryPlan !== "INVALID" && (
                <div className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 rounded-[2.5rem] border border-blue-500/20 shadow-xl">
                  <div className="text-center mb-8">
                    <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2">Output Potential:</p>
                    <div className="text-6xl font-black text-white">{inventoryPlan.units.toLocaleString()}</div>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase">{invType} {invTarget} Units</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard label="MGE Points" value={formatFull(inventoryPlan.mge)} icon={<Trophy size={16} className="text-yellow-500"/>}/>
                    <MetricCard label="KvK Points" value={formatFull(inventoryPlan.kvk)} icon={<Target size={16} className="text-red-500"/>}/>
                    <MetricCard label="Power Gain" value={formatFull(inventoryPlan.power)} icon={<Shield size={16} className="text-blue-500"/>}/>
                  </div>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800/50">
                    <ResMini label="Food" value={formatFull(inventoryPlan.res.food)} color="text-green-500"/>
                    <ResMini label="Wood" value={formatFull(inventoryPlan.res.wood)} color="text-orange-500"/>
                    <ResMini label="Stone" value={formatFull(inventoryPlan.res.stone)} color="text-purple-500"/>
                    <ResMini label="Gold" value={formatFull(inventoryPlan.res.gold)} color="text-yellow-500"/>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'train' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex gap-2 p-1.5 bg-[#16181d] rounded-2xl border border-gray-800 overflow-x-auto">
                {['T1','T2','T3','T4','T5'].map(t => (
                  <button key={t} onClick={()=>setActiveTier(t as Tier)} className={`flex-1 py-2.5 px-6 rounded-xl text-xs font-black transition-all ${activeTier===t?'bg-yellow-500 text-black shadow-lg':'text-gray-500'}`}>{t}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputBox label="Infantry" icon={<Shield size={18}/>} value={trainData[activeTier].infantry} onChange={v=>setTrainData(p=>({...p,[activeTier]:{...p[activeTier],infantry:v}}))}/>
                <InputBox label="Archery" icon={<Target size={18}/>} value={trainData[activeTier].archer} onChange={v=>setTrainData(p=>({...p,[activeTier]:{...p[activeTier],archer:v}}))}/>
                <InputBox label="Cavalry" icon={<Swords size={18}/>} value={trainData[activeTier].cavalry} onChange={v=>setTrainData(p=>({...p,[activeTier]:{...p[activeTier],cavalry:v}}))}/>
                <InputBox label="Siege" icon={<Hammer size={18}/>} value={trainData[activeTier].siege} onChange={v=>setTrainData(p=>({...p,[activeTier]:{...p[activeTier],siege:v}}))}/>
              </div>
            </div>
          )}
          
          {activeTab === 'upgrade' && (
             <div className="bg-[#16181d] p-8 rounded-[2.5rem] border border-gray-800 space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-center gap-8 bg-black/40 p-5 rounded-3xl border border-gray-800">
                  <select value={upgradeData.from} onChange={e=>setUpgradeData(p=>({...p,from:e.target.value as Tier}))} className="bg-transparent text-yellow-500 text-xl font-black outline-none cursor-pointer">
                    {['T1','T2','T3','T4'].map(t=><option key={t} value={t} className="bg-[#16181d]">{t}</option>)}
                  </select>
                  <ArrowUpRight className="text-gray-600" size={24}/>
                  <select value={upgradeData.to} onChange={e=>setUpgradeData(p=>({...p,to:e.target.value as Tier}))} className="bg-transparent text-yellow-500 text-xl font-black outline-none cursor-pointer">
                    {['T2','T3','T4','T5'].map(t=><option key={t} value={t} className="bg-[#16181d]">{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputBox label="Infantry" icon={<Shield size={18}/>} value={upgradeData.infantry} onChange={v=>setUpgradeData(p=>({...p,infantry:v}))}/>
                  <InputBox label="Archery" icon={<Target size={18}/>} value={upgradeData.archer} onChange={v=>setUpgradeData(p=>({...p,archer:v}))}/>
                  <InputBox label="Cavalry" icon={<Swords size={18}/>} value={upgradeData.cavalry} onChange={v=>setUpgradeData(p=>({...p,cavalry:v}))}/>
                  <InputBox label="Siege" icon={<Hammer size={18}/>} value={upgradeData.siege} onChange={v=>setUpgradeData(p=>({...p,siege:v}))}/>
                </div>
            </div>
          )}
        </div>

        {(activeTab === 'train' || activeTab === 'upgrade') && (
          <div className="lg:w-80">
            <div className="bg-[#16181d] rounded-[2.5rem] border border-gray-800 p-8 sticky top-8 shadow-2xl space-y-6">
              <div className="text-center border-b border-gray-800/50 pb-6">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Time</span>
                <div className="text-2xl font-black text-white font-mono mt-3 tabular-nums leading-none">{formatTime(results.time)}</div>
              </div>
              <div className="space-y-3">
                <ResultRow label="Total Power" value={formatFull(results.power)} icon={<Shield size={14} className="text-blue-500"/>}/>
                <ResultRow label="MGE Points" value={formatFull(results.mge)} icon={<Trophy size={14} className="text-yellow-500"/>}/>
                <ResultRow label="KvK Points" value={formatFull(results.kvk)} icon={<Target size={14} className="text-red-500"/>}/>
              </div>
              <div className="space-y-2 border-t border-gray-800 pt-6 text-[10px] font-black uppercase tracking-tighter">
                <div className="flex justify-between items-center"><span className="text-gray-500">Food</span><span className="text-green-500">{formatFull(results.food)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Wood</span><span className="text-orange-500">{formatFull(results.wood)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Stone</span><span className="text-purple-500">{formatFull(results.stone)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Gold</span><span className="text-yellow-500">{formatFull(results.gold)}</span></div>
              </div>
              <button onClick={()=>{setTrainData({T1:{infantry:0,cavalry:0,archer:0,siege:0},T2:{infantry:0,cavalry:0,archer:0,siege:0},T3:{infantry:0,cavalry:0,archer:0,siege:0},T4:{infantry:0,cavalry:0,archer:0,siege:0},T5:{infantry:0,cavalry:0,archer:0,siege:0}});setUpgradeData({from:'T4',to:'T5',infantry:0,archer:0,cavalry:0,siege:0})}} className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"><RotateCcw size={14}/> CLEAR ALL</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ... Utility components stay same ...
function InvInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <label className="bg-black/40 p-4 rounded-2xl border border-gray-800 group focus-within:border-blue-500/50 transition-all text-center cursor-pointer block">
      <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">{label}</p>
      <input type="number" value={value || ''} onChange={e=>onChange(parseInt(e.target.value)||0)} className="bg-transparent w-full text-center text-xl font-black text-white outline-none cursor-pointer" placeholder="0"/>
    </label>
  );
}
function SelectBox({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: (string | {v: string, l: string})[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-gray-500 uppercase px-2 tracking-widest">{label}</p>
      <select value={value} onChange={e=>onChange(e.target.value)} className="w-full bg-black/40 p-4 rounded-2xl border border-gray-800 text-yellow-500 font-bold outline-none capitalize cursor-pointer">
        {options.map(o => <option key={typeof o === 'string' ? o : o.v} value={typeof o === 'string' ? o : o.v}>{typeof o === 'string' ? o : o.l}</option>)}
      </select>
    </div>
  );
}
function MetricCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-black/40 p-5 rounded-3xl border border-gray-800 flex flex-col items-center justify-center">
      <div className="mb-2">{icon}</div>
      <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">{label}</p>
      <p className="text-xl font-black text-white font-mono">{value}</p>
    </div>
  );
}
function ResMini({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-black text-gray-500 uppercase mb-1">{label}</span>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  );
}
function InputBox({ label, icon, value, onChange }: { label: string, icon: React.ReactNode, value: number, onChange: (v: number) => void }) {
  return (
    <label className="bg-black/30 p-5 rounded-2xl border border-gray-800 flex items-center justify-between group focus-within:border-yellow-500/30 transition-all cursor-pointer">
      <div className="flex items-center gap-3 text-gray-500 group-focus-within:text-yellow-500">{icon} <span className="text-[11px] font-black uppercase tracking-widest">{label}</span></div>
      <input type="number" value={value || ''} onChange={e=>onChange(parseInt(e.target.value)||0)} className="bg-transparent text-right font-mono font-bold w-24 outline-none text-white text-lg cursor-pointer" placeholder="0"/>
    </label>
  );
}
function ResultRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-gray-800/50">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">{icon} {label}</div>
      <div className="font-mono font-bold text-sm text-gray-200">{value}</div>
    </div>
  );
}