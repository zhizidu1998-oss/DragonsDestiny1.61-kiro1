
import React, { useEffect, useRef, useState } from 'react';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('game_volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('game_language');
    return (saved === 'en' ? 'en' : 'zh') as 'zh' | 'en';
  });
  const [isElectron] = useState(() => !!(window as any).electron || navigator.userAgent.includes('Electron'));
  const [scale, setScale] = useState(1);

  // Changelog Data
  const CHANGELOG = [
      { date: "2025-12-19", ver: "v2.4", desc: "修复：宝箱现在会触发道具三选一界面。修复：限制输入队列防止自动转弯。优化：经验宝石使用新美术资源。调整：所有武器子弹飞行速度减半。" },
      { date: "2025-12-10", ver: "v2.3", desc: "修复：部分房间墙壁显示异常(负坐标问题)。修复：磁铁吸附道具时跟随龙头的Bug。" },
      { date: "2025-12-08", ver: "v2.2", desc: "修复：画面不跟随出生点房间Bug。修复：武器射速属性未生效的问题，调整毒液速度。" },
      { date: "2025-12-06", ver: "v2.1", desc: "新增双人模式：1P(方向键) / 2P(WASD)。共享生命/背包/经验。进出门同步传送。" },
      { date: "2025-12-05", ver: "v2.0", desc: "新增难度选项：简单模式（障碍减半/物资翻倍/怪物弱化/速度减缓）。优化：角色选择界面UI。" },
      { date: "2025-12-04", ver: "v1.9", desc: "平衡调整：矿工经验削弱至0.25(支持小数累计)；巨炮初始范围缩小至1格。优化：撞墙增加0.5秒无敌保护。" },
      { date: "2025-12-03", ver: "v1.8", desc: "调整：电浆伤害12，龙心削弱，掉率微调。新增：瘦身道具自动消耗，穿透可破墙。优化：鼠标光标校准，暴击红星特效，背包详细属性显示。" },
      { date: "2025-12-02", ver: "v1.7", desc: "平衡性调整：电浆伤害下调，龙心削弱。瘦身道具会在达到最小长度后消失。穿透属性现在允许攻击墙壁。优化鼠标瞄准与提示信息。" },
      { date: "2025-11-30", ver: "v1.5", desc: "新增龙眼(鼠标瞄准)、暗影斗篷；支持全键盘操作；测试模式增加回滚功能。" },
      { date: "2025-11-28", ver: "v1.3", desc: "道具合并(龙心)；数值显示优化；新增瘦身道具；掉落权重调整；巨炮范围成长。" },
      { date: "2025-11-27", ver: "v1.2", desc: "电浆连锁闪电；好学/贪婪/矿工平衡调整；速度撞击伤害机制；房间入口安全区。" },
      { date: "2025-11-26", ver: "v1.0", desc: "游戏初始发布。" }
  ];

  // 多语言文本
  const texts: Record<string, Record<string, string>> = {
    zh: {
      // 设置
      settings: '设置',
      volume: '音量',
      language: '语言',
      fullscreen: '全屏模式',
      chinese: '中文',
      english: 'English',
      close: '关闭',
      enterFullscreen: '进入全屏',
      exitFullscreen: '退出全屏',
      adjustVolume: '调节音量',
      toggleLanguage: '切换语言',
      toggleFullscreen: '切换全屏',
      closeSettings: '关闭设置',
      // 开始界面
      clickToStart: '点击开始选择你的巨龙。',
      startGame: '开始游戏',
      changelog: '更新日志',
      // 角色选择
      selectDragon: '选择巨龙',
      playerSelect: '玩家{0} 选择巨龙',
      difficultyNormal: '难度: 普通',
      difficultyEasy: '难度: 简单',
      easyDesc: '(物资UP 敌人弱化)',
      modeSingle: '模式: 单人',
      modeCoop: '模式: 双人合作',
      enterDungeon: '进入地牢',
      confirmP1: '确认 (P1)',
      testUnlockOn: '[测试] 全解锁: ON',
      testUnlockOff: '[测试] 全解锁: OFF',
      unlockHint: '通关简单模式可解锁',
      notUnlocked: '该角色尚未解锁！',
      // 角色
      fireDragon: '烈焰魔龙',
      iceDragon: '凛冬冰龙',
      poisonDragon: '剧毒腐龙',
      plasmaDragon: '电浆能量兽',
      sideDragon: '海战巨鯨',
      rapidDragon: '风暴迅猛兽',
      heavyDragon: '炮火巨兽',
      tripleDragon: '三头金蛇',
      initialWeapon: '初始武器',
      damageBonus: '伤害加成',
      baseStats: '基础属性',
      // 暂停
      paused: '暂停',
      resume: '继续游戏',
      encyclopedia: '百科全书',
      restart: '重新开始',
      // 升级
      bloodAwakening: '血脉觉醒',
      selectEnhance: '← 选择一项强化 →',
      // 游戏结束
      youDied: '你死了',
      journeyEnds: '你的征途结束了。',
      floorReached: '到达层数',
      finalScore: '最终得分',
      awakenAgain: '再次觉醒',
      // 胜利
      victory: '胜利！',
      conquered: '你征服了地牢！',
      // 百科全书
      encyclopediaTitle: '百科全书',
      selectItem: '选择一个道具',
      returnEsc: '返回 (ESC)',
      // 提示
      bossAppeared: 'BOSS出现了!',
      bossDefeated: '{0} 被击败了!',
      bagFull: '背包已满!',
      allUnlocked: '所有角色已解锁!',
      slimDone: '瘦身完成! 道具消失',
      bodyShrink: '身体缩短!',
      // 武器
      weapon_classic: '龙息',
      weapon_classic_desc: '标准的远程火球。',
      weapon_classic_upg: '每级: 伤害+20%',
      weapon_snowball: '雪球',
      weapon_snowball_desc: '有几率冻结敌人。',
      weapon_snowball_upg: '每级: 伤害+20%',
      weapon_venom: '毒液',
      weapon_venom_desc: '使敌人中毒持续掉血。',
      weapon_venom_upg: '每级: 伤害+20%',
      weapon_triple: '三头蛇',
      weapon_triple_desc: '向三个方向发射子弹。',
      weapon_triple_upg: '每级: 伤害+20%',
      weapon_rapid: '风暴',
      weapon_rapid_desc: '极快的射速。加成: 移速+10%。',
      weapon_rapid_upg: '每级: 伤害+20%, 移速+10%',
      weapon_heavy: '巨炮',
      weapon_heavy_desc: '缓慢但造成大范围爆炸。能击碎墙壁。副作用: 移速降低。',
      weapon_heavy_upg: '每级: 伤害+20%, 爆炸范围+1格',
      weapon_side: '侧舷炮',
      weapon_side_desc: '蛇身每隔一节向两侧开火。副作用: 降低主武器伤害。',
      weapon_side_upg: '每级: 伤害+20%, 主武器-20%',
      weapon_plasma: '电浆',
      weapon_plasma_desc: '命中后连锁电击周围2格内的敌人。',
      weapon_plasma_upg: '每级: 伤害+15%, 连锁范围+1格',
      // 被动技能
      passive_dmg: '龙牙',
      passive_dmg_desc: '提高所有武器的伤害倍率。',
      passive_dmg_upg: '每级: 伤害+20%',
      passive_def: '铁鳞',
      passive_def_desc: '减少受到的伤害。',
      passive_def_upg: '每级: 减伤+1',
      passive_hp: '龙心',
      passive_hp_desc: '增加生命上限，并每5秒回复5%生命。',
      passive_hp_upg: '每级: 生命+10, 回复效果增强',
      passive_spd: '风翼',
      passive_spd_desc: '增加子弹飞行速度与射速。',
      passive_spd_upg: '每级: 速度+20%',
      passive_magnet: '磁石',
      passive_magnet_desc: '增加道具拾取范围。',
      passive_magnet_upg: '每级: 范围+1.5格',
      passive_berserk: '狂暴',
      passive_berserk_desc: '生命值越低射速越快。',
      passive_berserk_upg: '每级: 效果增强30%',
      passive_devour: '贪婪',
      passive_devour_desc: '吞噬敌人/羊时回复10%最大生命(5s冷却)，羊也提供经验。',
      passive_devour_upg: '每级: 冷却-15%, 回血+10%, 经验+50%',
      passive_bounce: '弹射',
      passive_bounce_desc: '子弹在墙壁上反弹。',
      passive_bounce_upg: '每级: 反弹次数+1',
      passive_lucky: '幸运',
      passive_lucky_desc: '增加箱子和墙壁掉落物品的几率。',
      passive_lucky_upg: '每级: 掉率+10%',
      passive_miner: '矿工',
      passive_miner_desc: '破坏障碍物获得经验(0.25)。',
      passive_miner_upg: '每级: 经验+0.25',
      passive_learner: '好学',
      passive_learner_desc: '增加获取的经验值。',
      passive_learner_upg: '每级: 经验+30%',
      passive_crit: '暴击',
      passive_crit_desc: '攻击有几率造成双倍伤害。',
      passive_crit_upg: '每级: 暴击率+10%',
      passive_pierce: '穿透',
      passive_pierce_desc: '子弹穿透敌人。穿透允许武器伤害墙壁(墙HP:50)。',
      passive_pierce_upg: '每级: 穿透次数+1',
      passive_diet: '瘦身',
      passive_diet_desc: '龙不再变长，身体缩短。最小长度时道具消失。',
      passive_diet_upg: '每级: 缩短身体',
      passive_aim: '龙眼',
      passive_aim_desc: '主武器指哪打哪。',
      passive_aim_upg: '每级: 瞄准更精准',
      passive_mist: '迷雾',
      passive_mist_desc: '产生迷雾，敌人更难发现你(降低索敌范围)。',
      passive_mist_upg: '每级: 索敌范围进一步降低',
      // 升级卡片
      newWeapon: '新武器',
      newAbility: '新能力',
      upgrade: '升级',
      instantHeal: '即时回复',
      healAll: '恢复所有生命值',
      maxHeal: '治愈',
      // Boss
      bossWarning: '警告: BOSS来袭',
      // HUD
      floor: '层',
      swipeToMove: '滑动移动',
      // 百科全书详情
      weaponCat: '武器',
      passiveCat: '被动',
      dmgLabel: '伤害',
      rateLabel: '射速',
      baseValue: '基础数值',
      getItem: '获取 (+1)',
      removeItem: '移除 (-1)',
      upgradeEffect: '升级效果:',
      testGot: '测试: 已获取',
      testRemoved: '测试: 已移除',
      upgraded: '升级!',
      gotWeapon: '获得武器:',
      gotPassive: '获得被动:',
      baseDmg: '基础伤害',
      currDmg: '当前伤害',
      fireRate: '射速',
      statLabel: '属性',
      perLvLabel: '每级数值',
      totalLabel: '当前总值',
      allClear: '全部通关',
      // 更新日志
      changelogTitle: '更新日志',
      // 暂停按钮
      pauseHint: '暂停 (ESC/ENTER)',
    },
    en: {
      // Settings
      settings: 'Settings',
      volume: 'Volume',
      language: 'Language',
      fullscreen: 'Fullscreen',
      chinese: '中文',
      english: 'English',
      close: 'Close',
      enterFullscreen: 'Enter Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      adjustVolume: 'Adjust Volume',
      toggleLanguage: 'Toggle Language',
      toggleFullscreen: 'Toggle Fullscreen',
      closeSettings: 'Close Settings',
      // Start screen
      clickToStart: 'Click to select your dragon.',
      startGame: 'Start Game',
      changelog: 'Changelog',
      // Character select
      selectDragon: 'Select Dragon',
      playerSelect: 'Player {0} Select Dragon',
      difficultyNormal: 'Normal',
      difficultyEasy: 'Easy',
      easyDesc: '(More loot, weaker foes)',
      modeSingle: 'Single',
      modeCoop: 'Co-op',
      enterDungeon: 'Enter Dungeon',
      confirmP1: 'Confirm (P1)',
      testUnlockOn: '[Test] Unlock: ON',
      testUnlockOff: '[Test] Unlock: OFF',
      unlockHint: 'Beat Easy to unlock',
      notUnlocked: 'Not unlocked!',
      // Characters
      fireDragon: 'Inferno Dragon',
      iceDragon: 'Frost Dragon',
      poisonDragon: 'Venom Dragon',
      plasmaDragon: 'Plasma Beast',
      sideDragon: 'Sea Leviathan',
      rapidDragon: 'Storm Beast',
      heavyDragon: 'Artillery Beast',
      tripleDragon: 'Hydra Snake',
      initialWeapon: 'Weapon',
      damageBonus: 'DMG Bonus',
      baseStats: 'Base Stats',
      // Pause
      paused: 'Paused',
      resume: 'Resume',
      encyclopedia: 'Encyclopedia',
      restart: 'Restart',
      // Level up
      bloodAwakening: 'Awakening',
      selectEnhance: '← Select Enhancement →',
      // Game over
      youDied: 'You Died',
      journeyEnds: 'Your journey has ended.',
      floorReached: 'Floor',
      finalScore: 'Score',
      awakenAgain: 'Try Again',
      // Victory
      victory: 'Victory!',
      conquered: 'Dungeon conquered!',
      // Encyclopedia
      encyclopediaTitle: 'Encyclopedia',
      selectItem: 'Select an item',
      returnEsc: 'Return (ESC)',
      // Hints
      bossAppeared: 'BOSS APPEARED!',
      bossDefeated: '{0} DEFEATED!',
      bagFull: 'Bag full!',
      allUnlocked: 'All unlocked!',
      slimDone: 'Slim done!',
      bodyShrink: 'Body shrunk!',
      // Weapons
      weapon_classic: 'Fireball',
      weapon_classic_desc: 'Standard ranged fireball.',
      weapon_classic_upg: 'Per Lv: DMG +20%',
      weapon_snowball: 'Snowball',
      weapon_snowball_desc: 'Chance to freeze enemies.',
      weapon_snowball_upg: 'Per Lv: DMG +20%',
      weapon_venom: 'Venom',
      weapon_venom_desc: 'Poisons enemies over time.',
      weapon_venom_upg: 'Per Lv: DMG +20%',
      weapon_triple: 'Trident',
      weapon_triple_desc: 'Fires in 3 directions.',
      weapon_triple_upg: 'Per Lv: DMG +20%',
      weapon_rapid: 'Storm',
      weapon_rapid_desc: 'Very fast fire rate. +10% speed.',
      weapon_rapid_upg: 'Per Lv: DMG +20%, SPD +10%',
      weapon_heavy: 'Cannon',
      weapon_heavy_desc: 'Slow but huge AoE. Breaks walls. -Speed.',
      weapon_heavy_upg: 'Per Lv: DMG +20%, AoE +1',
      weapon_side: 'Broadside',
      weapon_side_desc: 'Body fires sideways. -Main DMG.',
      weapon_side_upg: 'Per Lv: DMG +20%, Main -20%',
      weapon_plasma: 'Plasma',
      weapon_plasma_desc: 'Chain lightning on hit.',
      weapon_plasma_upg: 'Per Lv: DMG +15%, Range +1',
      // Passives
      passive_dmg: 'Dragon Fang',
      passive_dmg_desc: 'Increases all weapon damage.',
      passive_dmg_upg: 'Per Lv: DMG +20%',
      passive_def: 'Iron Scale',
      passive_def_desc: 'Reduces damage taken.',
      passive_def_upg: 'Per Lv: DEF +1',
      passive_hp: 'Dragon Heart',
      passive_hp_desc: 'More HP, regen 5% every 5s.',
      passive_hp_upg: 'Per Lv: HP +10, Regen up',
      passive_spd: 'Wind Wing',
      passive_spd_desc: 'Faster bullets and fire rate.',
      passive_spd_upg: 'Per Lv: SPD +20%',
      passive_magnet: 'Magnet',
      passive_magnet_desc: 'Increases pickup range.',
      passive_magnet_upg: 'Per Lv: Range +1.5',
      passive_berserk: 'Berserk',
      passive_berserk_desc: 'Lower HP = faster fire rate.',
      passive_berserk_upg: 'Per Lv: Effect +30%',
      passive_devour: 'Devour',
      passive_devour_desc: 'Eat foes to heal 10% (5s CD).',
      passive_devour_upg: 'Per Lv: CD -15%, Heal +10%',
      passive_bounce: 'Bounce',
      passive_bounce_desc: 'Bullets bounce off walls.',
      passive_bounce_upg: 'Per Lv: Bounces +1',
      passive_lucky: 'Lucky',
      passive_lucky_desc: 'Better drop rates.',
      passive_lucky_upg: 'Per Lv: Drop +10%',
      passive_miner: 'Miner',
      passive_miner_desc: 'Gain XP from obstacles.',
      passive_miner_upg: 'Per Lv: XP +0.25',
      passive_learner: 'Scholar',
      passive_learner_desc: 'Gain more XP.',
      passive_learner_upg: 'Per Lv: XP +30%',
      passive_crit: 'Critical',
      passive_crit_desc: 'Chance for double damage.',
      passive_crit_upg: 'Per Lv: Crit +10%',
      passive_pierce: 'Pierce',
      passive_pierce_desc: 'Bullets pierce enemies & walls.',
      passive_pierce_upg: 'Per Lv: Pierce +1',
      passive_diet: 'Diet',
      passive_diet_desc: 'No growth, body shrinks.',
      passive_diet_upg: 'Per Lv: Shrink body',
      passive_aim: 'Dragon Eye',
      passive_aim_desc: 'Aim with mouse cursor.',
      passive_aim_upg: 'Per Lv: Better aim',
      passive_mist: 'Mist',
      passive_mist_desc: 'Enemies detect you less.',
      passive_mist_upg: 'Per Lv: Stealth up',
      // Level up cards
      newWeapon: 'New Weapon',
      newAbility: 'New Ability',
      upgrade: 'Upgrade',
      instantHeal: 'Instant Heal',
      healAll: 'Restore all HP',
      maxHeal: 'Max Heal',
      // Boss
      bossWarning: 'WARNING: BOSS INCOMING',
      // HUD
      floor: 'FLOOR',
      swipeToMove: 'Swipe to Move',
      // Encyclopedia details
      weaponCat: 'Weapon',
      passiveCat: 'Passive',
      dmgLabel: 'DMG',
      rateLabel: 'Rate',
      baseValue: 'Base Value',
      getItem: 'Get (+1)',
      removeItem: 'Remove (-1)',
      upgradeEffect: 'Upgrade:',
      testGot: 'Test: Got',
      testRemoved: 'Test: Removed',
      upgraded: 'Upgraded!',
      gotWeapon: 'Got Weapon:',
      gotPassive: 'Got Passive:',
      baseDmg: 'Base DMG',
      currDmg: 'Current DMG',
      fireRate: 'Fire Rate',
      statLabel: 'Stat',
      perLvLabel: 'Per Lv',
      totalLabel: 'Total',
      allClear: 'ALL CLEAR',
      // Changelog
      changelogTitle: 'CHANGELOG',
      // Pause button
      pauseHint: 'Pause (ESC/ENTER)',
    }
  };
  const t = texts[language];

  // 设置界面状态
  const [settingsIndex, setSettingsIndex] = useState(0);
  // 选项：音量、语言、全屏（仅Electron）、关闭
  const settingsOptions = React.useMemo(() => 
    isElectron ? ['volume', 'language', 'fullscreen', 'close'] : ['volume', 'language', 'close'], 
    [isElectron]
  );
  const settingsIndexRef = useRef(0);
  
  // 同步 ref 和 state
  useEffect(() => {
    settingsIndexRef.current = settingsIndex;
  }, [settingsIndex]);

  // 保存设置到 localStorage
  useEffect(() => {
    localStorage.setItem('game_volume', volume.toString());
    (window as any).gameVolume = volume;
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('game_language', language);
    // 暴露语言到 window 供游戏逻辑使用
    (window as any).gameLanguage = language;
    (window as any).getText = (key: string, ...args: any[]) => {
      let text = texts[language][key] || texts['zh'][key] || key;
      args.forEach((arg, i) => {
        text = text.replace(`{${i}}`, arg);
      });
      return text;
    };
  }, [language]);

  // 暴露 openSettings 到 window 供游戏逻辑调用
  useEffect(() => {
    // 记录打开设置时的语言
    let languageOnOpen = language;
    
    (window as any).openSettings = () => {
      languageOnOpen = (window as any).gameLanguage || 'zh';
      setShowSettings(true);
      setSettingsIndex(0);
    };
    (window as any).closeSettings = () => {
      setShowSettings(false);
      // 如果语言发生了变化，刷新页面以应用新语言
      const currentLang = (window as any).gameLanguage || 'zh';
      if (currentLang !== languageOnOpen) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    return () => { 
      delete (window as any).openSettings; 
      delete (window as any).closeSettings;
    };
  }, [language]);

  // 设置界面键盘操作
  useEffect(() => {
    if (!showSettings) return;
    
    const handleSettingsInput = (e: KeyboardEvent) => {
      // 忽略重复按键事件（按住不放时会持续触发）
      if (e.repeat) return;
      
      const currentIdx = settingsIndexRef.current;
      const optCount = settingsOptions.length;
      const currentOpt = settingsOptions[currentIdx];
      
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        const newIdx = (currentIdx - 1 + optCount) % optCount;
        setSettingsIndex(newIdx);
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        const newIdx = (currentIdx + 1) % optCount;
        setSettingsIndex(newIdx);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (currentOpt === 'volume') {
          setVolume(v => Math.max(0, Math.round((v - 0.1) * 10) / 10));
        } else if (currentOpt === 'language') {
          setLanguage('zh');
        }
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (currentOpt === 'volume') {
          setVolume(v => Math.min(1, Math.round((v + 0.1) * 10) / 10));
        } else if (currentOpt === 'language') {
          setLanguage('en');
        }
        e.preventDefault();
      } else if (e.key === 'Enter' || e.code === 'Space') {
        if (currentOpt === 'fullscreen') {
          toggleFullscreen();
        } else if (currentOpt === 'language') {
          setLanguage(l => l === 'zh' ? 'en' : 'zh');
        } else if (currentOpt === 'close') {
          (window as any).closeSettings?.();
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        (window as any).closeSettings?.();
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleSettingsInput);
    return () => document.removeEventListener('keydown', handleSettingsInput);
  }, [showSettings, settingsOptions]);

  // 设置界面手柄轮询 - 使用 useRef 保存状态避免闭包问题
  const gamepadStateRef = useRef({
    lastButtons: [] as boolean[],
    lastDirection: null as string | null,
    cooldownUntil: 0
  });
  
  useEffect(() => {
    if (!showSettings) return;
    
    const pollSettingsGamepad = () => {
      const now = Date.now();
      const state = gamepadStateRef.current;
      
      // 冷却检查
      if (now < state.cooldownUntil) return;
      
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
      if (!gp) return;
      
      const buttons = gp.buttons.map(b => b.pressed);
      const axes = [...gp.axes];
      
      // 按钮边缘检测
      const buttonPressed = (idx: number) => buttons[idx] && !state.lastButtons[idx];
      
      const ly = axes[1] || 0;
      const lx = axes[0] || 0;
      const deadzone = 0.5;
      
      // 计算当前方向
      let currentDirection: string | null = null;
      if (ly < -deadzone) currentDirection = 'up';
      else if (ly > deadzone) currentDirection = 'down';
      else if (lx < -deadzone) currentDirection = 'left';
      else if (lx > deadzone) currentDirection = 'right';
      
      // 方向边缘检测：只在方向变化时触发
      const directionChanged = currentDirection !== null && currentDirection !== state.lastDirection;
      
      const currentIdx = settingsIndexRef.current;
      const optCount = settingsOptions.length;
      const currentOpt = settingsOptions[currentIdx];
      
      let handled = false;
      
      // D-Pad 按钮或摇杆方向变化
      if (buttonPressed(12) || (directionChanged && currentDirection === 'up')) {
        const newIdx = (currentIdx - 1 + optCount) % optCount;
        setSettingsIndex(newIdx);
        handled = true;
      } else if (buttonPressed(13) || (directionChanged && currentDirection === 'down')) {
        const newIdx = (currentIdx + 1) % optCount;
        setSettingsIndex(newIdx);
        handled = true;
      } else if (buttonPressed(14) || (directionChanged && currentDirection === 'left')) {
        if (currentOpt === 'volume') {
          setVolume(v => Math.max(0, Math.round((v - 0.1) * 10) / 10));
        } else if (currentOpt === 'language') {
          setLanguage('zh');
        }
        handled = true;
      } else if (buttonPressed(15) || (directionChanged && currentDirection === 'right')) {
        if (currentOpt === 'volume') {
          setVolume(v => Math.min(1, Math.round((v + 0.1) * 10) / 10));
        } else if (currentOpt === 'language') {
          setLanguage('en');
        }
        handled = true;
      } else if (buttonPressed(0)) { // A/X 确认
        if (currentOpt === 'fullscreen') {
          toggleFullscreen();
        } else if (currentOpt === 'language') {
          setLanguage(l => l === 'zh' ? 'en' : 'zh');
        } else if (currentOpt === 'close') {
          (window as any).closeSettings?.();
        }
        handled = true;
      } else if (buttonPressed(1) || buttonPressed(9)) { // B/O or Start 返回
        (window as any).closeSettings?.();
        handled = true;
      }
      
      if (handled) {
        state.cooldownUntil = now + 200; // 200ms 冷却
      }
      
      // 更新状态
      state.lastButtons = [...buttons];
      state.lastDirection = currentDirection;
    };
    
    const intervalId = setInterval(pollSettingsGamepad, 16);
    return () => clearInterval(intervalId);
  }, [showSettings, settingsOptions]);

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // 自动缩放以适配窗口
  useEffect(() => {
    const GAME_WIDTH = 600;
    const GAME_HEIGHT = 730; // 包含道具槽的高度 660 + 70
    
    const updateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // 计算缩放比例，保持宽高比，留足够边距
      const scaleX = (windowWidth - 40) / GAME_WIDTH;
      const scaleY = (windowHeight - 40) / GAME_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1.8); // 最大放大1.8倍
      
      setScale(newScale);
      scaleRef.current = newScale;
      (window as any).gameScale = newScale;
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    // --- START OF GAME LOGIC ---
    
    // ✅ 优化：坐标哈希函数 (支持负坐标)
    // 之前直接位运算在负数时会出错，现在增加偏移量 10000 确保正数
    const packKey = (x: number, y: number) => ((x + 10000) << 16) | ((y + 10000) & 0xFFFF);
    const unpackKey = (key: number) => ({ x: (key >> 16) - 10000, y: (key & 0xFFFF) - 10000 });

    // Input Maps
    const KEYS_ARROWS: Record<string, {x: number, y: number}> = {
        'ArrowUp': {x: 0, y: -1}, 'ArrowDown': {x: 0, y: 1}, 
        'ArrowLeft': {x: -1, y: 0}, 'ArrowRight': {x: 1, y: 0}
    };
    const KEYS_WASD: Record<string, {x: number, y: number}> = {
        'w': {x: 0, y: -1}, 'W': {x: 0, y: -1},
        's': {x: 0, y: 1}, 'S': {x: 0, y: 1},
        'a': {x: -1, y: 0}, 'A': {x: -1, y: 0},
        'd': {x: 1, y: 0}, 'D': {x: 1, y: 0}
    };

    // Global Constants
    const gridSize = 20; 
    const ROOM_WIDTH = 30;
    const ROOM_HEIGHT = 30;
    const MAP_OFFSET_Y = 60; 
    const MAX_FLOORS = 3;
    const DEVOUR_COOLDOWN_BASE = 300; 
    const MAX_SLOTS = 4;

    // Game Variables
    let gameLoopId: number | null = null;
    let isPaused = false;
    let score = 0;
    let level = 1;
    let floor = 1;
    let xp = 0;
    let xpToNextLevel = 5; 
    let devourTimer = 0;
    let invincibleTimer = 0;
    let regenTimer = 0; 
    let magnetGrowPending = 0; // 磁铁吸附食物时待增长的身体节数
    let difficulty = 'easy'; // 'normal' | 'easy' - 默认简单模式
    let numPlayers = 1; // 1 or 2

    // UI State
    let uiState = 'start'; 
    let previousUiState: string | null = null; 
    const DRAGONS = ['fire', 'ice', 'poison', 'plasma', 'side', 'rapid', 'heavy', 'triple'];
    let dragonMenuIndex = 0;
    let charSelectRow = 0; // 0: cards, 1: difficulty/mode, 2: confirm, 3: test
    let optionCol = 0; // 0: difficulty, 1: mode (用于难度/模式行的左右选择)
    let selectingPlayer = 1; // 1 (P1) or 2 (P2)
    let p1Char = 'fire';
    let p2Char = 'ice';
    
    let pauseMenuIndex = 0;
    let wikiIndex = 0;
    let wikiItems: any[] = []; 

    // Character Unlocks - 默认只有前3个解锁
    let unlockedDragons: any = { fire: true, ice: true, poison: true, plasma: false, side: false, rapid: false, heavy: false, triple: false };
    let isTestMode = false;
    
    // 角色数据：名字、图片、初始武器、颜色、身体图片
    // 使用 getText 获取翻译文本
    const getText = (window as any).getText || ((key: string) => key);
    
    const dragonData: any = {
        fire: { nameKey: 'fireDragon', img: '/shadow-dragon.png', weapon: 'CLASSIC', weaponKey: 'weapon_classic', descKey: 'weapon_classic_desc' },
        ice: { nameKey: 'iceDragon', img: '/void-dragon.png', weapon: 'SNOWBALL', weaponKey: 'weapon_snowball', descKey: 'weapon_snowball_desc' },
        poison: { nameKey: 'poisonDragon', img: '/thunder-dragon.png', weapon: 'VENOM', weaponKey: 'weapon_venom', descKey: 'weapon_venom_desc' },
        plasma: { nameKey: 'plasmaDragon', img: '/earth-dragon.png', weapon: 'PLASMA', weaponKey: 'weapon_plasma', descKey: 'weapon_plasma_desc' },
        side: { nameKey: 'sideDragon', img: '/light-dragon.png', weapon: 'SIDE', weaponKey: 'weapon_side', descKey: 'weapon_side_desc' },
        rapid: { nameKey: 'rapidDragon', img: '/wind-dragon.png', weapon: 'RAPID', weaponKey: 'weapon_rapid', descKey: 'weapon_rapid_desc' },
        heavy: { nameKey: 'heavyDragon', img: '/water-dragon.png', weapon: 'HEAVY', weaponKey: 'weapon_heavy', descKey: 'weapon_heavy_desc' },
        triple: { nameKey: 'tripleDragon', img: '/metal-dragon.png', weapon: 'TRIPLE', weaponKey: 'weapon_triple', descKey: 'weapon_triple_desc' }
    };
    
    const dragonStats: any = {
        fire: { color: '#8b0000', dmgMod: 1.2, bodyImg: '/redlong.png' },
        ice: { color: '#00558b', dmgMod: 1.0, bodyImg: '/bluelong.png' },
        poison: { color: '#006400', dmgMod: 1.0, bodyImg: '/greenlong.png' },
        plasma: { color: '#00ffff', dmgMod: 1.0, bodyImg: '/bluelong.png' },
        side: { color: '#4a6fa5', dmgMod: 1.0, bodyImg: '/bluelong.png' },
        rapid: { color: '#ffff00', dmgMod: 1.0, bodyImg: '/greenlong.png' },
        heavy: { color: '#ff4400', dmgMod: 1.3, bodyImg: '/redlong.png' },
        triple: { color: '#d4af37', dmgMod: 1.0, bodyImg: '/greenlong.png' }
    };

    // Level Up State
    let selectedRewardIndex = 0;
    let levelUpChoices: any[] = [];

    // World
    let rooms: any = {}; 
    let currentRoomKey = "0,0";
    let worldObjects: any = {
        walls: new Set<number>(), crates: [], items: [], pickups: [], 
        bullets: [], particles: [], explosions: [], lightning: []
    };
    let wallDamages = new Map<number, number>(); 

    let boss: any = null;
    let exitPortal: any = null;
    let bossRoomLocked = false;

    // Player(s)
    interface SnakeEntity {
        id: number;
        body: {x: number, y: number}[];
        velocity: {x: number, y: number};
        lastDir: {x: number, y: number};
        inputQueue: {x: number, y: number}[];
        type: string;
        color: string;
    }
    let snakes: SnakeEntity[] = [];

    // Stats
    let maxHp = 100;
    let currentHp = 100;
    let frameCount = 0;

    // Definitions (WEAPONS & PASSIVES with translation keys)
    const WEAPONS: any = {
        CLASSIC: { id: 'classic', nameKey: 'weapon_classic', rate: 40, damage: 15, speed: 0.75, type: 'classic', icon: '🔥', img: '/classic.png', color: '#ff5500', descKey: 'weapon_classic_desc', upgKey: 'weapon_classic_upg' }, 
        SNOWBALL: { id: 'snowball', nameKey: 'weapon_snowball', rate: 30, damage: 12, speed: 1.0, type: 'snowball', icon: '❄️', img: '/snowball.png', color: '#4da6ff', descKey: 'weapon_snowball_desc', upgKey: 'weapon_snowball_upg' },
        VENOM:    { id: 'venom', nameKey: 'weapon_venom', rate: 40, damage: 8, speed: 0.75, type: 'venom', icon: '🤢', img: '/venom.png', color: '#00ff00', descKey: 'weapon_venom_desc', upgKey: 'weapon_venom_upg' },
        TRIPLE:  { id: 'triple', nameKey: 'weapon_triple',  rate: 60, damage: 10, speed: 0.5, type: 'triple', icon: '🔱', img: '/triple.png', color: '#00ffaa', descKey: 'weapon_triple_desc', upgKey: 'weapon_triple_upg' }, 
        RAPID:   { id: 'rapid', nameKey: 'weapon_rapid',   rate: 24, damage: 5,  speed: 1.25, type: 'rapid', icon: '⚡', img: '/rapid.png', color: '#ffff00', descKey: 'weapon_rapid_desc', upgKey: 'weapon_rapid_upg' }, 
        HEAVY:   { id: 'heavy', nameKey: 'weapon_heavy',   rate: 120, damage: 50, speed: 0.5, type: 'heavy', icon: '💣', img: '/heavy.png', color: '#ff0000', descKey: 'weapon_heavy_desc', upgKey: 'weapon_heavy_upg' },
        SIDE:     { id: 'side', nameKey: 'weapon_side', rate: 60, damage: 4, speed: 0.5, type: 'side', icon: '⚓', img: '/side.png', color: '#777777', descKey: 'weapon_side_desc', upgKey: 'weapon_side_upg' },
        PLASMA:   { id: 'plasma', nameKey: 'weapon_plasma', rate: 24, damage: 12, speed: 1.25, type: 'plasma', icon: '🌀', img: '/plasma.png', color: '#00ffff', descKey: 'weapon_plasma_desc', upgKey: 'weapon_plasma_upg' },
    };

    const PASSIVES: any[] = [
        { id: 'dmg', nameKey: 'passive_dmg', stat: 'damagePercent', val: 0.2, icon: '⚔️', img: '/dmg.png', descKey: 'passive_dmg_desc', upgKey: 'passive_dmg_upg' },
        { id: 'def', nameKey: 'passive_def', stat: 'defense', val: 1, icon: '🛡️', img: '/def.png', descKey: 'passive_def_desc', upgKey: 'passive_def_upg' },
        { id: 'hp',  nameKey: 'passive_hp', stat: 'hpBonus', val: 10, icon: '❤️', img: '/hp.png', descKey: 'passive_hp_desc', upgKey: 'passive_hp_upg' },
        { id: 'spd', nameKey: 'passive_spd', stat: 'speedMod', val: 0.2, icon: '⏩', img: '/spd.png', descKey: 'passive_spd_desc', upgKey: 'passive_spd_upg' },
        { id: 'magnet', nameKey: 'passive_magnet', stat: 'pickupRange', val: 1, icon: '🧲', img: '/magnet.png', descKey: 'passive_magnet_desc', upgKey: 'passive_magnet_upg' },
        { id: 'berserk', nameKey: 'passive_berserk', stat: 'berserk', val: 0.3, icon: '🩸', img: '/berserk.png', descKey: 'passive_berserk_desc', upgKey: 'passive_berserk_upg' },
        { id: 'devour', nameKey: 'passive_devour', stat: 'devour', val: 1, icon: '🦖', img: '/devour.png', descKey: 'passive_devour_desc', upgKey: 'passive_devour_upg' },
        { id: 'bounce', nameKey: 'passive_bounce', stat: 'bounce', val: 1, icon: '🏀', img: '/bounce.png', descKey: 'passive_bounce_desc', upgKey: 'passive_bounce_upg' },
        { id: 'lucky', nameKey: 'passive_lucky', stat: 'lucky', val: 0.1, icon: '🍀', img: '/lucky.png', descKey: 'passive_lucky_desc', upgKey: 'passive_lucky_upg' },
        { id: 'miner', nameKey: 'passive_miner', stat: 'miner', val: 0.25, icon: '⛏️', img: '/miner.png', descKey: 'passive_miner_desc', upgKey: 'passive_miner_upg' },
        { id: 'learner', nameKey: 'passive_learner', stat: 'learner', val: 0.3, icon: '🎓', img: '/learner.png', descKey: 'passive_learner_desc', upgKey: 'passive_learner_upg' },
        { id: 'crit', nameKey: 'passive_crit', stat: 'crit', val: 0.1, icon: '🎯', img: '/crit.png', descKey: 'passive_crit_desc', upgKey: 'passive_crit_upg' },
        { id: 'pierce', nameKey: 'passive_pierce', stat: 'pierce', val: 1, icon: '🪓', img: '/pierce.png', descKey: 'passive_pierce_desc', upgKey: 'passive_pierce_upg' },
        { id: 'diet', nameKey: 'passive_diet', stat: 'diet', val: 1, icon: '🥒', img: '/diet.png', descKey: 'passive_diet_desc', upgKey: 'passive_diet_upg' },
        { id: 'aim', nameKey: 'passive_aim', stat: 'mouseAim', val: 1, icon: '👁️', img: '/aim.png', descKey: 'passive_aim_desc', upgKey: 'passive_aim_upg' },
        { id: 'mist', nameKey: 'passive_mist', stat: 'stealth', val: 3, icon: '🌫️', img: '/mist.png', descKey: 'passive_mist_desc', upgKey: 'passive_mist_upg' }
    ];

    let weaponInventory: any[] = []; 
    let passiveInventory: any[] = []; 

    // Helper function to render icon (image or emoji)
    const renderIcon = (item: any, size: number = 24) => {
        if (item.img) {
            // 将绝对路径 /xxx.png 转换为相对路径 ./xxx.png
            const imgSrc = item.img.startsWith('/') ? '.' + item.img : item.img;
            const itemName = item.nameKey ? getText(item.nameKey) : (item.name || '');
            return `<img src="${imgSrc}" alt="${itemName}" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;" />`;
        }
        return item.icon;
    };

    // Image cache for canvas rendering
    const imageCache: Record<string, HTMLImageElement> = {};
    const loadImage = (src: string): HTMLImageElement | null => {
        // 将绝对路径 /xxx.png 转换为相对路径 ./xxx.png
        const normalizedSrc = src.startsWith('/') ? '.' + src : src;
        if (!imageCache[normalizedSrc]) {
            const img = new Image();
            img.src = normalizedSrc;
            imageCache[normalizedSrc] = img;
        }
        return imageCache[normalizedSrc].complete ? imageCache[normalizedSrc] : null;
    };

    // Colors
    const C_BG = '#1a1a20';
    const C_HUD_BG = '#000000'; 
    let C_SNAKE_HEAD = '#8b0000'; // Default, will be P1 color
    const C_CRATE = '#8b5a2b';
    const C_FOOD_SHEEP = '#ffffff';
    const C_FOOD_WILDFIRE = '#00ccff'; 
    const C_ENEMY_WALKER = '#3d5afe'; 
    const C_PORTAL = '#d000ff';
    const C_UI_GOLD = '#d4af37';
    const C_PICKUP_WEAPON = '#ff4400';
    const C_BULLET = '#ffaa00';
    const C_FROZEN_OVERLAY = '#99e6ff'; 

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to replace global function definitions (SoundSystem kept same)
    const SoundSystem = {
        ctx: null as AudioContext | null,
        init: function() {
            if (this.ctx) return;
            const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextCtor();
        },
        play: function(type: string, volMult: number = 1.0) {
            if (!this.ctx) this.init();
            if (this.ctx!.state === 'suspended') this.ctx!.resume();
            
            // 获取全局音量设置
            const globalVolume = (window as any).gameVolume ?? 0.5;
            const finalVolMult = volMult * globalVolume;
            
            const now = this.ctx!.currentTime;
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
    
            switch(type) {
                case 'uiSelect': 
                    osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1); break;
                case 'uiConfirm': 
                    osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2); break;
                case 'shoot': 
                    osc.type = 'square'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
                    gain.gain.setValueAtTime(0.05 * finalVolMult, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15); break;
                case 'shoot_heavy': 
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3); break;
                case 'shoot_rapid': 
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.linearRampToValueAtTime(1200, now + 0.05);
                    gain.gain.setValueAtTime(0.05 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.05);
                    osc.start(now); osc.stop(now + 0.05); break;
                case 'shoot_shotgun': 
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(200, now + 0.15);
                    gain.gain.setValueAtTime(0.08 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15); break;
                case 'shoot_side': 
                    osc.type = 'square'; osc.frequency.setValueAtTime(500, now); osc.frequency.setValueAtTime(700, now + 0.05);
                    gain.gain.setValueAtTime(0.05 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1); break;
                case 'shoot_ice': 
                    osc.type = 'sine'; osc.frequency.setValueAtTime(1500, now); osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1); break;
                case 'shoot_venom': 
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(200, now + 0.15);
                    gain.gain.setValueAtTime(0.08 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15); break;
                case 'hit': 
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.1);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1); break;
                case 'pickup': 
                    osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.setValueAtTime(1600, now + 0.05);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15); break;
                case 'explode': 
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
                    gain.gain.setValueAtTime(0.2 * finalVolMult, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3); break;
                case 'levelup': 
                    this.playNote(523.25, now, 0.1, finalVolMult * 0.06); this.playNote(659.25, now+0.1, 0.1, finalVolMult * 0.06); this.playNote(783.99, now+0.2, 0.1, finalVolMult * 0.06); this.playNote(1046.50, now+0.3, 0.3, finalVolMult * 0.06); break;
                case 'gameover': 
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(100, now + 1.0);
                    gain.gain.setValueAtTime(0.2 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 1.0);
                    osc.start(now); osc.stop(now + 1.0); break;
                case 'eat': 
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(50, now + 0.1);
                    gain.gain.setValueAtTime(0.3 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2); break;
                case 'zap': 
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(2000, now); osc.frequency.linearRampToValueAtTime(500, now + 0.1);
                    gain.gain.setValueAtTime(0.1 * finalVolMult, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1); break;
            }
        },
        playNote: function(freq: number, time: number, dur: number, vol: number = 0.1) {
            const osc = this.ctx!.createOscillator(); const gain = this.ctx!.createGain();
            osc.connect(gain); gain.connect(this.ctx!.destination);
            osc.type = 'square'; osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(vol, time); gain.gain.linearRampToValueAtTime(0, time + dur);
            osc.start(time); osc.stop(time + dur);
        }
    };

    function init() {
        const savedUnlocks = localStorage.getItem('dragon_unlocks');
        if (savedUnlocks) unlockedDragons = JSON.parse(savedUnlocks);
        
        const startBtn = document.getElementById('btn-start-game');
        if(startBtn) startBtn.onclick = goToCharSelect;
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.onclick = togglePause;
            pauseBtn.classList.add('hidden');
        }
        
        // 初始时隐藏道具栏
        const invPanel = document.getElementById('inventory-panel');
        if(invPanel) invPanel.style.display = 'none';
        
        // 启动独立的手柄轮询循环（在游戏循环之外也能工作）
        startGamepadPolling();
        
        // 定义全局刷新UI函数，供语言切换后调用
        const refreshGameUI = () => {
            // 根据当前UI状态刷新对应界面
            if (uiState === 'start') {
                // 开始界面的文本由 React 渲染，不需要手动刷新
            } else if (uiState === 'char_select') {
                refreshCharCards();
                updateCharDetail(selectingPlayer === 1 ? p1Char : p2Char);
            } else if (uiState === 'paused') {
                updatePauseMenu();
            } else if (uiState === 'playing') {
                // 游戏中不需要刷新太多，但可以刷新道具栏
            } else if (uiState === 'levelup') {
                renderLevelUpCards();
            } else if (uiState === 'encyclopedia') {
                renderWikiGrid();
                updateWikiDetails();
            } else if (uiState === 'gameover') {
                // 游戏结束界面由 React 渲染
            }
            // 刷新道具栏
            updateInventoryUI();
        };
        
        // 监听语言切换事件
        window.addEventListener('languageChanged', refreshGameUI);
    }
    
    // 独立的手柄轮询循环
    let gamepadPollingId: number | null = null;
    function startGamepadPolling() {
        function pollLoop() {
            // 只在非游戏状态或暂停时处理手柄（游戏中由 loop 处理）
            if (uiState !== 'playing') {
                handleGamepadInput();
            }
            gamepadPollingId = requestAnimationFrame(pollLoop);
        }
        pollLoop();
    }

    // --- GAME LOGIC FUNCTIONS ---

    function toggleTestMode() {
        SoundSystem.play('uiSelect');
        isTestMode = !isTestMode;
        const btn = document.getElementById('unlock-toggle');
        if(btn) {
            btn.innerText = isTestMode ? getText('testUnlockOn') : getText('testUnlockOff');
            btn.classList.toggle('active', isTestMode);
        }
        refreshCharCards();
    }
    
    function toggleDifficulty() {
        SoundSystem.play('uiSelect');
        difficulty = difficulty === 'normal' ? 'easy' : 'normal';
        refreshCharCards();
    }
    
    function toggleGameMode() {
        SoundSystem.play('uiSelect');
        numPlayers = numPlayers === 1 ? 2 : 1;
        refreshCharCards();
    }

    function goToCharSelect() {
        SoundSystem.init(); 
        SoundSystem.play('uiConfirm');
        uiState = 'char_select';
        charSelectRow = 0;
        selectingPlayer = 1;
        document.getElementById('start-screen')?.classList.add('hidden');
        document.getElementById('gameover-screen')?.classList.add('hidden');
        document.getElementById('more-dragons-screen')?.classList.add('hidden');
        document.getElementById('char-select-screen')?.classList.remove('hidden');
        // Reset defaults
        p1Char = 'fire';
        p2Char = 'ice';
        dragonMenuIndex = DRAGONS.indexOf(p1Char);
        if(dragonMenuIndex === -1) dragonMenuIndex = 0;
        refreshCharCards();
        updateCharDetail(p1Char);
        
        // Bind wiki button click
        const wikiBtn = document.getElementById('wiki-btn-select');
        if(wikiBtn) wikiBtn.onclick = openEncyclopedia;
        
        // Bind character card clicks
        DRAGONS.forEach(type => {
            const el = document.getElementById(`char-${type}`);
            if(el) {
                el.onclick = () => {
                    // 检查是否解锁
                    if (!unlockedDragons[type] && !isTestMode) {
                        const msg = document.getElementById('lock-msg');
                        if(msg) {
                            msg.innerText = getText('unlockHint');
                            setTimeout(() => msg.innerText = "", 2000);
                        }
                        return;
                    }
                    setChar(type);
                    updateCharDetail(type);
                };
            }
        });
    }
    
    function updateCharDetail(type: string) {
        const data = dragonData[type];
        const stats = dragonStats[type];
        const imgEl = document.getElementById('char-detail-img') as HTMLImageElement;
        const previewImg1 = document.getElementById('char-preview-img1') as HTMLImageElement;
        const previewImg2 = document.getElementById('char-preview-img2') as HTMLImageElement;
        const nameEl = document.getElementById('char-detail-name');
        const weaponEl = document.getElementById('char-detail-weapon');
        const descEl = document.getElementById('char-detail-desc');
        const statsEl = document.getElementById('char-detail-stats');
        
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        
        // 获取翻译后的文本
        const charName = getText(data.nameKey);
        const weaponName = getText(data.weaponKey);
        const charDesc = getText(data.descKey);
        
        if(imgEl) imgEl.src = data.img.startsWith('/') ? '.' + data.img : data.img;
        if(previewImg1) previewImg1.src = data.img.startsWith('/') ? '.' + data.img : data.img;
        if(previewImg2) previewImg2.src = data.img.startsWith('/') ? '.' + data.img : data.img;
        if(nameEl) {
            nameEl.innerText = charName;
            // 英文版使用更小的字体
            nameEl.style.fontSize = isEn ? '28px' : '36px';
            nameEl.style.letterSpacing = isEn ? '0.05em' : '0.1em';
        }
        if(weaponEl) {
            const weaponLabel = getText('initialWeapon');
            weaponEl.innerHTML = `${weaponLabel}: <span style="color:#aaa">${weaponName}</span>`;
            weaponEl.style.fontSize = isEn ? '18px' : '24px';
        }
        if(descEl) {
            descEl.innerText = charDesc;
            descEl.style.fontSize = isEn ? '16px' : '20px';
        }
        if(statsEl) {
            const dmgLabel = getText('damageBonus');
            const baseLabel = getText('baseStats');
            const dmgBonus = stats.dmgMod !== 1.0 ? `${dmgLabel}: ${stats.dmgMod > 1 ? '+' : ''}${Math.round((stats.dmgMod - 1) * 100)}%` : '';
            statsEl.innerText = dmgBonus || baseLabel;
            statsEl.style.fontSize = isEn ? '14px' : '18px';
        }
    }
    
    function refreshCharCards() {
        // Use current picking dragon for display logic
        // charSelectRow: 0=角色卡片, 1=难度/模式, 2=设置, 3=进入地牢, 4=测试
        const currentChar = selectingPlayer === 1 ? p1Char : p2Char;
        dragonMenuIndex = DRAGONS.indexOf(currentChar);

        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';

        const title = document.getElementById('char-select-title');
        if (title) {
            if (numPlayers === 1) title.innerText = getText('selectDragon');
            else title.innerText = getText('playerSelect', selectingPlayer);
            
            // Highlight P2 specific text color
            if(selectingPlayer === 2) title.style.color = '#00ccff';
            else title.style.color = '#b30000';
            
            // 英文版字体调整
            title.style.fontSize = isEn ? '14px' : '16px';
        }

        DRAGONS.forEach((type, idx) => {
            const el = document.getElementById(`char-${type}`);
            if(el) {
                const isUnlocked = unlockedDragons[type] || isTestMode;
                el.className = 'char-card-mini'; 
                if (!isUnlocked) el.classList.add('locked');
                
                // Highlight logic
                if (type === currentChar) el.classList.add('selected');

                el.onclick = () => {
                    charSelectRow = 0;
                    setChar(type);
                    updateCharDetail(type);
                }
            }
        });
        
        // Difficulty Button
        const diffBtn = document.getElementById('btn-difficulty');
        if(diffBtn) {
            diffBtn.className = 'btn';
            const normalText = getText('difficultyNormal');
            const easyText = getText('difficultyEasy');
            const easyDesc = getText('easyDesc');
            diffBtn.innerHTML = difficulty === 'normal' 
                ? normalText 
                : `${easyText} <span style="font-size:8px; display:block;">${easyDesc}</span>`;
            // 简单模式白色，普通模式绿色
            diffBtn.style.color = difficulty === 'normal' ? '#0f0' : '#fff';
            if(difficulty === 'normal') diffBtn.style.borderColor = '#0f0';
            else diffBtn.style.borderColor = '#500';
            
            // 普通模式时高亮，或者当键盘导航到此按钮时高亮
            if (difficulty === 'normal' || (charSelectRow === 1 && optionCol === 0)) {
                diffBtn.classList.add('selected-btn');
            }
            diffBtn.onclick = toggleDifficulty;
            
            // 英文版字体调整，中文放大30%
            diffBtn.style.fontSize = isEn ? '10px' : '16px';
        }

        // Mode Button
        const modeBtn = document.getElementById('btn-mode');
        if(modeBtn) {
            modeBtn.className = 'btn';
            const singleText = getText('modeSingle');
            const coopText = getText('modeCoop');
            modeBtn.innerHTML = numPlayers === 1 ? singleText : coopText;
            modeBtn.style.color = numPlayers === 1 ? '#fff' : '#00ccff';
            if(numPlayers === 2) modeBtn.style.borderColor = '#00558b';
            else modeBtn.style.borderColor = '#500';

            // 双人模式时高亮，或者当键盘导航到此按钮时高亮
            if (numPlayers === 2 || (charSelectRow === 1 && optionCol === 1)) {
                modeBtn.classList.add('selected-btn');
            }
            modeBtn.onclick = toggleGameMode;
            
            // 英文版字体调整，中文放大30%
            modeBtn.style.fontSize = isEn ? '10px' : '16px';
        }
        
        // Settings Button
        const settingsBtn = document.getElementById('btn-char-settings');
        if(settingsBtn) {
            settingsBtn.className = 'btn mb-[6px]';
            if (charSelectRow === 2) settingsBtn.classList.add('selected-btn');
            settingsBtn.onclick = () => { (window as any).openSettings?.(); };
            settingsBtn.innerHTML = `⚙️ ${getText('settings')}`;
            settingsBtn.style.fontSize = isEn ? '10px' : '16px';
        }
        
        // Confirm Button
        const confirmBtn = document.getElementById('btn-confirm-char');
        if(confirmBtn) {
            confirmBtn.className = 'btn';
            if (charSelectRow === 3) confirmBtn.classList.add('selected-btn');
            const confirmP1Text = getText('confirmP1');
            const enterText = getText('enterDungeon');
            confirmBtn.innerText = (numPlayers === 2 && selectingPlayer === 1) ? confirmP1Text : enterText;
            confirmBtn.onclick = confirmChar;
            
            // 英文版字体调整，中文放大30%
            confirmBtn.style.fontSize = isEn ? '14px' : '20px';
        }
        
        const toggleBtn = document.getElementById('unlock-toggle');
        if(toggleBtn) {
            if (charSelectRow === 4) toggleBtn.classList.add('selected-nav');
            else toggleBtn.classList.remove('selected-nav');
            toggleBtn.onclick = toggleTestMode;
            toggleBtn.innerText = isTestMode ? getText('testUnlockOn') : getText('testUnlockOff');
        }
    }

    function setChar(type: string) {
        SoundSystem.play('uiSelect');
        if (selectingPlayer === 1) p1Char = type;
        else p2Char = type;
        refreshCharCards();
        updateCharDetail(type);
    }

    function confirmChar() {
        const currentChar = selectingPlayer === 1 ? p1Char : p2Char;
        if (!unlockedDragons[currentChar] && !isTestMode) {
            const msg = document.getElementById('lock-msg');
            if(msg) {
                msg.innerText = getText('notUnlocked');
                setTimeout(() => msg.innerText = "", 2000);
            }
            return;
        }
        SoundSystem.play('uiConfirm');

        if (numPlayers === 2 && selectingPlayer === 1) {
            selectingPlayer = 2;
            dragonMenuIndex = DRAGONS.indexOf(p2Char);
            refreshCharCards();
            return;
        }

        document.getElementById('char-select-screen')?.classList.add('hidden');
        startGame();
    }

    function startGame() {
        uiState = 'playing';
        document.getElementById('pause-btn')?.classList.remove('hidden');
        // 显示道具栏
        const invPanel = document.getElementById('inventory-panel');
        if(invPanel) invPanel.style.display = 'flex';
        resetGame();
    }

    function togglePause() {
        if (uiState === 'gameover' || uiState === 'start' || uiState === 'char_select') return;
        
        if (isPaused && uiState === 'paused') {
            isPaused = false;
            uiState = 'playing';
            document.getElementById('pause-screen')?.classList.add('hidden');
            SoundSystem.play('uiConfirm');
            // loop 已经在运行，只需要设置 isPaused = false
        } else if (!isPaused && uiState === 'playing') {
            isPaused = true;
            uiState = 'paused';
            pauseMenuIndex = 0;
            updatePauseMenu();
            document.getElementById('pause-screen')?.classList.remove('hidden');
            // 不停止 loop，让它继续运行以处理手柄输入
            SoundSystem.play('uiSelect');
        }
    }

    function updatePauseMenu() {
        const btns = ['btn-resume', 'btn-settings', 'btn-wiki', 'btn-restart'];
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        
        // 更新暂停标题
        const pauseTitle = document.querySelector('#pause-screen h1');
        if (pauseTitle) {
            pauseTitle.textContent = getText('paused');
        }
        
        btns.forEach((id, idx) => {
            const btn = document.getElementById(id);
            if (btn) {
                if (idx === pauseMenuIndex) btn.classList.add('selected-btn');
                else btn.classList.remove('selected-btn');
                
                if(id === 'btn-resume') {
                    btn.onclick = togglePause;
                    btn.textContent = getText('resume');
                }
                if(id === 'btn-settings') {
                    btn.onclick = () => { (window as any).openSettings?.(); };
                    btn.textContent = getText('settings');
                }
                if(id === 'btn-wiki') {
                    btn.onclick = openEncyclopedia;
                    btn.textContent = getText('encyclopedia');
                }
                if(id === 'btn-restart') {
                    btn.onclick = restartFromPause;
                    btn.textContent = getText('restart');
                }
                
                // 英文版字体调整
                btn.style.fontSize = isEn ? '14px' : '16px';
            }
        });
    }

    function confirmPauseAction() {
        if (pauseMenuIndex === 0) togglePause(); 
        else if (pauseMenuIndex === 1) { (window as any).openSettings?.(); }
        else if (pauseMenuIndex === 2) openEncyclopedia(); 
        else if (pauseMenuIndex === 3) restartFromPause(); 
    }

    function restartFromPause() {
        // 停止游戏循环
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        isPaused = false;
        
        // 隐藏暂停界面
        document.getElementById('pause-screen')?.classList.add('hidden');
        document.getElementById('pause-btn')?.classList.add('hidden');
        
        // 隐藏道具栏
        const invPanel = document.getElementById('inventory-panel');
        if(invPanel) invPanel.style.display = 'none';
        
        goToCharSelect(); 
    }

    function openEncyclopedia() {
        previousUiState = uiState;
        uiState = 'encyclopedia';
        
        document.getElementById('char-select-screen')?.classList.add('hidden');
        document.getElementById('pause-screen')?.classList.add('hidden');
        document.getElementById('levelup-screen')?.classList.add('hidden');
        document.getElementById('encyclopedia-screen')?.classList.remove('hidden');
        
        wikiItems = [];
        Object.values(WEAPONS).forEach((w: any) => wikiItems.push({...w, cat: 'WEAPON'}));
        PASSIVES.forEach((p: any) => wikiItems.push({...p, cat: 'PASSIVE'}));
        
        wikiIndex = 0;
        renderWikiGrid();
        updateWikiDetails();
        SoundSystem.play('uiConfirm');

        const closeBtn = document.getElementById('btn-close-wiki');
        if(closeBtn) closeBtn.onclick = closeEncyclopedia;
    }

    function closeEncyclopedia() {
        document.getElementById('encyclopedia-screen')?.classList.add('hidden');
        
        if (previousUiState === 'char_select') {
            document.getElementById('char-select-screen')?.classList.remove('hidden');
            uiState = 'char_select';
        } else if (previousUiState === 'levelup') {
            document.getElementById('levelup-screen')?.classList.remove('hidden');
            uiState = 'levelup';
        } else {
            document.getElementById('pause-screen')?.classList.remove('hidden');
            uiState = 'paused';
        }
        
        SoundSystem.play('uiSelect');
    }

    function renderWikiGrid() {
        const grid = document.getElementById('wiki-grid');
        if(!grid) return;
        grid.innerHTML = '';
        wikiItems.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = `wiki-icon ${idx === wikiIndex ? 'selected' : ''}`;
            div.innerHTML = renderIcon(item, 40);
            div.onclick = () => {
                wikiIndex = idx;
                renderWikiGrid();
                updateWikiDetails();
                SoundSystem.play('uiSelect');
            };
            grid.appendChild(div);
        });
    }

    function updateWikiDetails() {
        const item = wikiItems[wikiIndex];
        const title = document.getElementById('wiki-title');
        const stats = document.getElementById('wiki-stats');
        const upgrade = document.getElementById('wiki-upgrade');

        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        const catName = item.cat === 'WEAPON' ? getText('weaponCat') : getText('passiveCat');
        const itemName = item.nameKey ? getText(item.nameKey) : item.name;
        const itemDesc = item.descKey ? getText(item.descKey) : item.desc;
        const itemUpg = item.upgKey ? getText(item.upgKey) : item.upg;
        
        // 英文版使用更小的字体
        const titleSize = isEn ? '16px' : '20px';
        const descSize = isEn ? '13px' : '14px';
        
        if(title) title.innerHTML = `<div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;"><div style="flex:1;"><div style="font-size:${titleSize}; color:#d4af37;">${itemName}</div><div style="font-size:12px; color:#666;">${catName}</div></div><div>${renderIcon(item, 80)}</div></div>`;
        
        let statHtml = `<div class="stat-label" style="font-size:${descSize};">${itemDesc}</div>`;
        if (item.cat === 'WEAPON') {
            const dmgLabel = getText('dmgLabel');
            const rateLabel = getText('rateLabel');
            statHtml += `<div class="stat-label" style="font-size:${descSize};">${dmgLabel}: ${item.damage} | ${rateLabel}: ${(60/item.rate).toFixed(1)}/s</div>`;
        } else {
            const baseLabel = getText('baseValue');
            statHtml += `<div class="stat-label" style="font-size:${descSize};">${baseLabel}: ${item.val}</div>`;
        }
        if(stats) stats.innerHTML = statHtml;
        
        const getLabel = getText('getItem');
        const removeLabel = getText('removeItem');
        const upgLabel = getText('upgradeEffect');
        const testBtnHtml = `<div style="margin-top:10px; border-top:1px dashed #333; padding-top:10px; display:flex; flex-direction:column; gap:5px;">
            <button id="btn-wiki-cheat" class="btn" style="flex:1; height:30px; width:100%; font-size:10px; padding:0; background:#444;">${getLabel}</button>
            <button id="btn-wiki-remove" class="btn" style="flex:1; height:30px; width:100%; font-size:10px; padding:0; background:#400;">${removeLabel}</button>
        </div>`;
        
        if(upgrade) {
            upgrade.innerHTML = `<span style="color:#aaa; font-size:${descSize};">${upgLabel}</span><br><span style="color:#0f0; font-size:${descSize};">${itemUpg}</span> ${testBtnHtml}`;
            
            const btn = document.getElementById('btn-wiki-cheat');
            if(btn) {
                btn.onclick = () => {
                    const pickupType = item.cat === 'WEAPON' ? 'weapon' : 'passive';
                    tryPickup({ type: pickupType, data: item });
                    updateInventoryUI();
                    const testLabel = getText('testGot');
                    showToast(`${testLabel} ${itemName}`, item);
                };
            }
            const rmBtn = document.getElementById('btn-wiki-remove');
            if(rmBtn) {
                rmBtn.onclick = () => {
                    removeItemStack(item.id, item.cat === 'WEAPON');
                    updateInventoryUI();
                    const testLabel = getText('testRemoved');
                    showToast(`${testLabel} ${itemName}`, "🗑️");
                };
            }
        }
    }

    function removeItemStack(id: string, isWeapon: boolean) {
        if (isWeapon) {
            const idx = weaponInventory.findIndex(w => w.id === id);
            if (idx !== -1) {
                if (weaponInventory[idx].stack > 1) {
                    weaponInventory[idx].stack--;
                } else {
                    weaponInventory.splice(idx, 1);
                }
            }
        } else {
             const idx = passiveInventory.findIndex(p => p.id === id);
            if (idx !== -1) {
                const item = passiveInventory[idx];
                if (item.stat === 'hpBonus') { maxHp -= item.val; currentHp = Math.min(currentHp, maxHp); }

                if (item.stack > 1) {
                    item.stack--;
                } else {
                    passiveInventory.splice(idx, 1);
                }
            }
        }
    }

    function resetGame() {
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        C_SNAKE_HEAD = dragonStats[p1Char].color;

        document.getElementById('gameover-screen')?.classList.add('hidden');
        document.getElementById('levelup-screen')?.classList.add('hidden');
        document.getElementById('char-select-screen')?.classList.add('hidden'); 
        const bossHp = document.getElementById('boss-hp-container');
        if(bossHp) bossHp.style.display = 'none';
        const bossWarn = document.getElementById('boss-warning');
        if(bossWarn) bossWarn.style.display = 'none';

        score = 0;
        level = 1;
        floor = 1;
        xp = 0;
        xpToNextLevel = 5; 
        maxHp = 100;
        currentHp = 100;
        devourTimer = 0;
        invincibleTimer = 0;
        regenTimer = 0;
        magnetGrowPending = 0;
        frameCount = 0; // 重置帧计数器
        
        weaponInventory = [];
        passiveInventory = [];
        bossRoomLocked = false;
        
        // Add initial weapons for P1 based on character
        const p1WeaponKey = dragonData[p1Char]?.weapon || 'CLASSIC';
        addWeapon(WEAPONS[p1WeaponKey]);

        // Add initial weapons for P2 if exists (shared inventory)
        if (numPlayers === 2) {
            const p2WeaponKey = dragonData[p2Char]?.weapon || 'CLASSIC';
            // Only add if different from P1's weapon
            if (p2WeaponKey !== p1WeaponKey) {
                addWeapon(WEAPONS[p2WeaponKey]);
            }
        }

        updateInventoryUI();

        isPaused = false;
        startFloor();
        loop();
    }

    function startFloor() {
        currentRoomKey = "0,0"; // Fix camera bug by resetting camera focus to spawn room
        worldObjects.walls.clear();
        wallDamages.clear(); // ✅ 优化：Map.clear()
        worldObjects.crates = [];
        worldObjects.items = [];
        worldObjects.pickups = [];
        worldObjects.bullets = [];
        worldObjects.particles = [];
        worldObjects.explosions = [];
        worldObjects.lightning = [];
        boss = null;
        exitPortal = null;
        bossRoomLocked = false;
        snakes = [];
        
        const startX = Math.floor(ROOM_WIDTH/2);
        const startY = Math.floor(ROOM_HEIGHT/2);
        
        // P1 Setup
        snakes.push({
            id: 1,
            body: [ { x: startX, y: startY }, { x: startX, y: startY + 1 }, { x: startX, y: startY + 2 } ],
            velocity: { x: 0, y: -1 },
            lastDir: { x: 0, y: -1 },
            inputQueue: [],
            type: p1Char,
            color: dragonStats[p1Char].color
        });

        // P2 Setup
        if (numPlayers === 2) {
            snakes.push({
                id: 2,
                body: [ { x: startX + 2, y: startY }, { x: startX + 2, y: startY + 1 }, { x: startX + 2, y: startY + 2 } ],
                velocity: { x: 0, y: -1 },
                lastDir: { x: 0, y: -1 },
                inputQueue: [],
                type: p2Char,
                color: dragonStats[p2Char].color
            });
        }
        
        const floorDisplay = document.getElementById('floor-display');
        if(floorDisplay) floorDisplay.innerText = `FLOOR ${floor}-${MAX_FLOORS}`;
        const bossWarn = document.getElementById('boss-warning');
        if(bossWarn) bossWarn.style.display = 'none';
        const bossHp = document.getElementById('boss-hp-container');
        if(bossHp) bossHp.style.display = 'none';
        
        generateWorld();
        updateHud();
    }

    function addWallGlobal(x: number, y: number) {
        worldObjects.walls.add(packKey(x, y));
    }

    function clearWalls(x: number, y: number, w: number, h: number) {
        for(let i=0; i<w; i++) {
            for(let j=0; j<h; j++) {
                worldObjects.walls.delete(packKey(x+i, y+j));
            }
        }
    }

    function initBoss(cx: number, cy: number) {
        boss = {
            x: cx - 2, y: cy - 2, w: 4, h: 4,
            hp: 2000, maxHp: 2000,
            active: false, dead: false, spawned: false,
            spawnTimer: 60,
            name: "DOOM BRINGER",
            color: '#9000ff',
            roomGX: Math.floor(cx / ROOM_WIDTH),
            roomGY: Math.floor(cy / ROOM_HEIGHT),
            moveRate: 10,
            frozen: 0, poisoned: 0, poisonTimer: 0,
            dashState: 'idle', dashTimer: 0, dashDir: {x:0, y:0}
        };
        
        if (floor === 2) { boss.maxHp = 3500; boss.hp = 3500; boss.name = "FRACTAL GUARDIAN"; boss.moveRate = 8; boss.w = 12; boss.h = 12; }
        if (floor === 3) { boss.maxHp = 5000; boss.hp = 5000; boss.name = "VOID EMPEROR"; boss.moveRate = 5; }
        
        if (numPlayers === 2) {
             boss.maxHp = Math.floor(boss.maxHp * 1.5);
             boss.hp = boss.maxHp;
        }
    }

    function spawnItemAt(x: number, y: number, type: string) {
        let w = 1, h = 1;
        let hp = 1;
        
        if (type === 'walker') { hp = 30 + (floor * 10); }
        if (floor === 2 && type === 'walker') { w = 2; h = 2; hp *= 2; }
        if (floor === 3 && type === 'walker') { w = 1; h = 1; hp *= 1.5; }

        worldObjects.items.push({
            x: x, y: y, w: w, h: h, type: type, hp: hp, maxHp: hp,
            dead: false, frozen: 0, poisoned: 0, poisonTimer: 0
        });
    }

    function spawnItemInRoom(room: any, type: string) {
        const offsetX = room.gx * ROOM_WIDTH;
        const offsetY = room.gy * ROOM_HEIGHT;
        const safeMargin = 2;
        
        for(let t=0; t<10; t++) {
            const rx = Math.floor(Math.random() * (ROOM_WIDTH - safeMargin * 2)) + safeMargin;
            const ry = Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin * 2)) + safeMargin;
            const x = offsetX + rx;
            const y = offsetY + ry;
            
            if (!isBlocked(x, y)) {
                spawnItemAt(x, y, type);
                return;
            }
        }
    }

    function lockRoom(gx: number, gy: number) {
        bossRoomLocked = true;
        const roomKey = `${gx},${gy}`;
        const room = rooms[roomKey];
        if(!room) return;

        const offsetX = gx * ROOM_WIDTH;
        const offsetY = gy * ROOM_HEIGHT;
        const midX = Math.floor(ROOM_WIDTH / 2);
        const midY = Math.floor(ROOM_HEIGHT / 2);

        room.connected.forEach((d: any) => {
            if (d.x === 1) { 
                for(let i=0; i<4; i++) addWallGlobal(offsetX + ROOM_WIDTH - 1, offsetY + midY - 2 + i);
            }
            if (d.x === -1) {
                for(let i=0; i<4; i++) addWallGlobal(offsetX, offsetY + midY - 2 + i);
            }
            if (d.y === 1) {
                for(let i=0; i<4; i++) addWallGlobal(offsetX + midX - 2 + i, offsetY + ROOM_HEIGHT - 1);
            }
            if (d.y === -1) {
                for(let i=0; i<4; i++) addWallGlobal(offsetX + midX - 2 + i, offsetY);
            }
        });
    }

    function unlockRoom(gx: number, gy: number) {
        bossRoomLocked = false;
        const roomKey = `${gx},${gy}`;
        const room = rooms[roomKey];
        if(!room) return;
        
        const offsetX = gx * ROOM_WIDTH;
        const offsetY = gy * ROOM_HEIGHT;
        const midX = Math.floor(ROOM_WIDTH / 2);
        const midY = Math.floor(ROOM_HEIGHT / 2);
        
        room.connected.forEach((d: any) => {
            if (d.x === 1) clearWalls(offsetX + ROOM_WIDTH - 1, offsetY + midY - 2, 1, 4);
            if (d.x === -1) clearWalls(offsetX, offsetY + midY - 2, 1, 4);
            if (d.y === 1) clearWalls(offsetX + midX - 2, offsetY + ROOM_HEIGHT - 1, 4, 1);
            if (d.y === -1) clearWalls(offsetX + midX - 2, offsetY, 4, 1);
        });
    }

    function generateWorld() {
        let attempts = 0;
        let success = false;
        const difficultyMod = (p1Char === 'ice' || p1Char === 'poison' || p2Char === 'ice' || p2Char === 'poison') ? 2 : 0;
        const maxRooms = 6 + floor * 2 + difficultyMod; 
        
        while (!success && attempts < 50) {
            attempts++;
            rooms = {};
            const queue = [{x:0, y:0, dist: 0}];
            let createdCount = 0;
            let maxDistRoom = {x:0, y:0, dist: -1}; 
            
            while (queue.length > 0 && createdCount < maxRooms) {
                const curr = queue.shift()!;
                const key = `${curr.x},${curr.y}`;
                if (rooms[key]) continue;
                
                rooms[key] = { gx: curr.x, gy: curr.y, connected: [], isBossRoom: false, explored: false };
                createdCount++;
                
                if (curr.dist > maxDistRoom.dist) maxDistRoom = curr;
                
                const dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
                dirs.sort(() => Math.random() - 0.5); 
                
                for (let d of dirs) {
                    const nx = curr.x + d.x;
                    const ny = curr.y + d.y;
                    const nKey = `${nx},${ny}`;
                    
                    if (!rooms[nKey]) {
                        if (Math.random() > 0.3 && createdCount < maxRooms) {
                            queue.push({x: nx, y: ny, dist: curr.dist + 1});
                        }
                    }
                }
            }
    
            if (Object.keys(rooms).length >= 5) {
                success = true;
                Object.values(rooms).forEach((room: any) => {
                    const dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
                    dirs.forEach(d => {
                        const nKey = `${room.gx + d.x},${room.gy + d.y}`;
                        if (rooms[nKey]) room.connected.push(d);
                    });
                    const isBossRoom = (room.gx === maxDistRoom.x && room.gy === maxDistRoom.y);
                    if (isBossRoom) room.isBossRoom = true;
                    populateRoom(room, isBossRoom);
                });
            }
        }
    }

    function populateRoom(room: any, isBossRoom: boolean) {
        const offsetX = room.gx * ROOM_WIDTH;
        const offsetY = room.gy * ROOM_HEIGHT;
        
        for (let x = 0; x < ROOM_WIDTH; x++) { addWallGlobal(offsetX + x, offsetY); addWallGlobal(offsetX + x, offsetY + ROOM_HEIGHT - 1); }
        for (let y = 0; y < ROOM_HEIGHT; y++) { addWallGlobal(offsetX, offsetY + y); addWallGlobal(offsetX + ROOM_WIDTH - 1, offsetY + y); }
        
        const midX = Math.floor(ROOM_WIDTH / 2);
        const midY = Math.floor(ROOM_HEIGHT / 2);
        room.connected.forEach((d: any) => {
            if (d.x === 1) clearWalls(offsetX + ROOM_WIDTH - 1, offsetY + midY - 2, 1, 4);
            if (d.x === -1) clearWalls(offsetX, offsetY + midY - 2, 1, 4);
            if (d.y === 1) clearWalls(offsetX + midX - 2, offsetY + ROOM_HEIGHT - 1, 4, 1);
            if (d.y === -1) clearWalls(offsetX + midX - 2, offsetY, 4, 1);
        });
        
        if (isBossRoom) {
            initBoss(offsetX + midX, offsetY + midY);
        } else if (room.gx !== 0 || room.gy !== 0) {
            const density = 0.1 + (floor * 0.1); 
            const area = (ROOM_WIDTH - 4) * (ROOM_HEIGHT - 4);
            // 简单模式：障碍物减半
            const obstacleMod = difficulty === 'easy' ? 0.5 : 1;
            const numObstacles = Math.floor(area * density * obstacleMod);
            
            const pattern = Math.floor(Math.random() * 8);
            const crateThreshold = 0.4; 
            const safeMargin = 5; 

            for(let i=0; i<numObstacles; i++) {
                let ox = 0, oy = 0;
                let valid = false;
                
                for(let t=0; t<20; t++) {
                     if(pattern === 0) { 
                        ox = offsetX + safeMargin + Math.floor(Math.random() * (ROOM_WIDTH - safeMargin*2));
                        oy = offsetY + safeMargin + Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin*2));
                     } else if (pattern === 1) { 
                        ox = offsetX + safeMargin + Math.floor(Math.random() * (ROOM_WIDTH - safeMargin*2));
                        oy = offsetY + safeMargin + Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin*2));
                        if((ox + oy) % 2 !== 0) continue; 
                     } else if (pattern === 2) { 
                        const localY = Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin*2));
                        if (localY % 3 !== 0) continue;
                        oy = offsetY + safeMargin + localY;
                        ox = offsetX + safeMargin + Math.floor(Math.random() * (ROOM_WIDTH - safeMargin*2));
                     } else if (pattern === 3) { 
                        const localX = Math.floor(Math.random() * (ROOM_WIDTH - safeMargin*2));
                        if (localX % 3 !== 0) continue;
                        ox = offsetX + safeMargin + localX;
                        oy = offsetY + safeMargin + Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin*2));
                     } else if (pattern === 4) { 
                        ox = offsetX + safeMargin + Math.floor(Math.random() * (ROOM_WIDTH - safeMargin*2));
                        oy = offsetY + safeMargin + Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin*2));
                        const dx = Math.abs(ox - (offsetX + midX));
                        const dy = Math.abs(oy - (offsetX + midY));
                        const dist = Math.max(dx, dy);
                        if(dist !== 5 && dist !== 9) continue;
                     } else if (pattern === 5) { 
                        if(Math.random() > 0.5) {
                            ox = offsetX + midX + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random()*2);
                            oy = offsetY + safeMargin + Math.floor(Math.random()*(ROOM_HEIGHT-safeMargin*2));
                        } else {
                            oy = offsetY + midY + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random()*2);
                            ox = offsetX + safeMargin + Math.floor(Math.random()*(ROOM_WIDTH-safeMargin*2));
                        }
                     } else if (pattern === 6) { 
                        const qx = Math.random() > 0.5 ? 1 : 0;
                        const qy = Math.random() > 0.5 ? 1 : 0;
                        ox = offsetX + safeMargin + qx*(ROOM_WIDTH - safeMargin*2 - 5) + Math.floor(Math.random()*5);
                        oy = offsetY + safeMargin + qy*(ROOM_HEIGHT - safeMargin*2 - 5) + Math.floor(Math.random()*5);
                     } else if (pattern === 7) { 
                         const r = Math.random();
                         if(r < 0.2) { 
                             ox = offsetX + midX + Math.floor((Math.random()-0.5)*6);
                             oy = offsetY + midY + Math.floor((Math.random()-0.5)*6);
                         } else { 
                             ox = offsetX + safeMargin + Math.floor(Math.random() * (ROOM_WIDTH - safeMargin*2));
                             oy = offsetY + safeMargin + Math.floor(Math.random() * (ROOM_HEIGHT - safeMargin*2));
                             if(ox % 6 !== 0 || oy % 6 !== 0) continue;
                         }
                     }

                     if (ox > offsetX + 2 && ox < offsetX + ROOM_WIDTH - 3 && 
                         oy > offsetY + 2 && oy < offsetY + ROOM_HEIGHT - 3 &&
                         (Math.abs(ox - (offsetX + midX)) >= 4 || Math.abs(oy - (offsetY + midY)) >= 4) &&
                         !isBlocked(ox, oy)) {
                         
                         const relX = ox - offsetX;
                         const relY = oy - offsetY;
                         
                         if (Math.abs(relX - midX) < 5 && (relY < 6 || relY > ROOM_HEIGHT - 7)) continue;
                         if (Math.abs(relY - midY) < 5 && (relX < 6 || relX > ROOM_WIDTH - 7)) continue;

                         valid = true;
                         break;
                     }
                }

                if(valid) {
                    if (Math.random() < crateThreshold) worldObjects.crates.push({x: ox, y: oy, hp: 5});
                    else addWallGlobal(ox, oy);
                }
            }
            
            // 简单模式：物资翻倍
            const resourceMod = difficulty === 'easy' ? 2 : 1;
            const resourceCount = Math.floor((8 + Math.floor(floor * 2)) * resourceMod); 
            const herds = [];
            for(let h=0; h<3; h++) {
                herds.push({
                    x: offsetX + 5 + Math.floor(Math.random() * (ROOM_WIDTH - 10)),
                    y: offsetY + 5 + Math.floor(Math.random() * (ROOM_HEIGHT - 10))
                });
            }
            
            for(let i=0; i<resourceCount; i++) {
                if(Math.random() > 0.4) {
                    const herd = herds[i % 3];
                    const sx = herd.x + Math.floor((Math.random()-0.5)*8);
                    const sy = herd.y + Math.floor((Math.random()-0.5)*8);
                    if(!isBlocked(sx, sy) && sx > offsetX+2 && sx < offsetX+ROOM_WIDTH-3 && sy > offsetY+2 && sy < offsetY+ROOM_HEIGHT-3) {
                        spawnItemAt(sx, sy, 'sheep');
                    } else {
                        spawnItemInRoom(room, 'sheep'); 
                    }
                } else spawnItemInRoom(room, 'wildfire');
            }
            
            let enemyCount = 2 + Math.floor(floor);
            if (floor === 3) enemyCount *= 2; 
            
            // Co-op: slightly more enemies
            if (numPlayers === 2) enemyCount += 2;

            for(let i=0; i<enemyCount; i++) {
                spawnItemInRoom(room, 'walker');
            }
        }
    }

    function dropLootItem(x: number, y: number, type: string) {
        if (type === 'wildfire') {
            let newItem = {x: x, y: y, type: 'wildfire', w: 1, h: 1};
            if (!isBlocked(x, y)) {
                worldObjects.items.push(newItem);
            }
        }
    }

    function dropItem(x: number, y: number) {
        // 确保坐标是整数，避免浮点坐标导致无法拾取
        x = Math.floor(x);
        y = Math.floor(y);
        // 宝箱掉落：玩家捡到时触发三选一界面
        worldObjects.pickups.push({ x: x, y: y, type: 'chest', data: null });
    }

    function getWeaponStack(id: string) {
        const w = weaponInventory.find((i: any) => i.id === id);
        return w ? w.stack : 0;
    }

    function getPassiveStack(id: string) {
        const p = passiveInventory.find((i: any) => i.id === id);
        return p ? p.stack : 0;
    }

    function checkMinerProc() {
        const minerStack = getPassiveStack('miner');
        if (minerStack > 0) {
            const bonus = 0.25 * minerStack;
            gainXp(bonus);
            return true;
        }
        return false;
    }

    // ========== 手柄支持 ==========
    let gamepadState = {
        lastButtons: [] as boolean[],
        lastAxes: [0, 0, 0, 0],
        axisDeadzone: 0.5,
        inputCooldown: 0
    };

    function pollGamepad() {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
        if (!gp) return null;

        const buttons = gp.buttons.map(b => b.pressed);
        const axes = [...gp.axes];
        
        // 检测按钮按下（边缘触发）
        const buttonPressed = (idx: number) => {
            return buttons[idx] && !gamepadState.lastButtons[idx];
        };
        
        // 检测方向（带死区）
        const getDirection = () => {
            // 左摇杆
            const lx = axes[0] || 0;
            const ly = axes[1] || 0;
            // D-Pad (按钮 12-15 或 axes)
            const dpadUp = buttons[12];
            const dpadDown = buttons[13];
            const dpadLeft = buttons[14];
            const dpadRight = buttons[15];
            
            if (dpadUp || ly < -gamepadState.axisDeadzone) return 'up';
            if (dpadDown || ly > gamepadState.axisDeadzone) return 'down';
            if (dpadLeft || lx < -gamepadState.axisDeadzone) return 'left';
            if (dpadRight || lx > gamepadState.axisDeadzone) return 'right';
            return null;
        };
        
        // Xbox: A=0, B=1, X=2, Y=3, LB=4, RB=5, Back=8, Start=9
        // PS5:  X=0, O=1, □=2, △=3, L1=4, R1=5, Share=8, Options=9
        const result = {
            confirm: buttonPressed(0), // A / X
            cancel: buttonPressed(1),  // B / O
            start: buttonPressed(9),   // Start / Options
            direction: getDirection(),
            directionChanged: false
        };
        
        // 检测方向变化（用于菜单导航）
        const prevDir = (() => {
            const plx = gamepadState.lastAxes[0] || 0;
            const ply = gamepadState.lastAxes[1] || 0;
            const pdpadUp = gamepadState.lastButtons[12];
            const pdpadDown = gamepadState.lastButtons[13];
            const pdpadLeft = gamepadState.lastButtons[14];
            const pdpadRight = gamepadState.lastButtons[15];
            
            if (pdpadUp || ply < -gamepadState.axisDeadzone) return 'up';
            if (pdpadDown || ply > gamepadState.axisDeadzone) return 'down';
            if (pdpadLeft || plx < -gamepadState.axisDeadzone) return 'left';
            if (pdpadRight || plx > gamepadState.axisDeadzone) return 'right';
            return null;
        })();
        
        result.directionChanged = result.direction !== prevDir && result.direction !== null;
        
        // 更新状态
        gamepadState.lastButtons = buttons;
        gamepadState.lastAxes = axes;
        
        return result;
    }

    function handleGamepadInput() {
        if (gamepadState.inputCooldown > 0) {
            gamepadState.inputCooldown--;
            return;
        }
        
        const input = pollGamepad();
        if (!input) return;
        
        const setCooldown = (frames: number = 8) => { gamepadState.inputCooldown = frames; };
        
        // 开始界面
        if (uiState === 'start') {
            if (input.confirm || input.start) {
                goToCharSelect();
                setCooldown();
            }
            return;
        }
        
        // 角色选择界面
        if (uiState === 'char_select') {
            if (input.directionChanged) {
                if (input.direction === 'up') {
                    if (charSelectRow === 0 && dragonMenuIndex >= 4) {
                        dragonMenuIndex -= 4;
                        setChar(DRAGONS[dragonMenuIndex]);
                    } else if (charSelectRow > 0) {
                        charSelectRow--;
                        if (charSelectRow === 0) dragonMenuIndex = Math.min(dragonMenuIndex, 3) + 4;
                    }
                } else if (input.direction === 'down') {
                    if (charSelectRow === 0 && dragonMenuIndex < 4) {
                        dragonMenuIndex += 4;
                        if (dragonMenuIndex >= DRAGONS.length) dragonMenuIndex = DRAGONS.length - 1;
                        setChar(DRAGONS[dragonMenuIndex]);
                    } else if (charSelectRow === 0 && dragonMenuIndex >= 4) {
                        charSelectRow = 1;
                    } else if (charSelectRow < 4) {
                        charSelectRow++;
                    }
                } else if (input.direction === 'left') {
                    if (charSelectRow === 0 && dragonMenuIndex % 4 > 0) {
                        dragonMenuIndex--;
                        setChar(DRAGONS[dragonMenuIndex]);
                    } else if (charSelectRow === 1) {
                        optionCol = 0;
                    }
                } else if (input.direction === 'right') {
                    if (charSelectRow === 0 && dragonMenuIndex % 4 < 3 && dragonMenuIndex < DRAGONS.length - 1) {
                        dragonMenuIndex++;
                        setChar(DRAGONS[dragonMenuIndex]);
                    } else if (charSelectRow === 1) {
                        optionCol = 1;
                    }
                }
                refreshCharCards();
                SoundSystem.play('uiSelect');
                setCooldown();
            }
            if (input.confirm) {
                // charSelectRow: 0=角色卡片, 1=难度/模式, 2=设置, 3=进入地牢, 4=测试
                if (charSelectRow === 0) {
                    charSelectRow = 3; // 跳到进入地牢按钮
                } else if (charSelectRow === 1) {
                    if (optionCol === 0) toggleDifficulty();
                    else toggleGameMode();
                } else if (charSelectRow === 2) {
                    (window as any).openSettings?.();
                } else if (charSelectRow === 3) {
                    confirmChar();
                } else if (charSelectRow === 4) {
                    toggleTestMode();
                }
                refreshCharCards();
                setCooldown();
            }
            if (input.cancel) {
                // 返回开始界面
                document.getElementById('char-select-screen')?.classList.add('hidden');
                document.getElementById('start-screen')?.classList.remove('hidden');
                uiState = 'start';
                setCooldown();
            }
            return;
        }
        
        // 游戏中
        if (uiState === 'playing') {
            if (input.start) {
                togglePause();
                setCooldown();
                return;
            }
            // 移动控制
            if (input.direction && snakes[0]) {
                const lastVel = snakes[0].inputQueue.length > 0 
                    ? snakes[0].inputQueue[snakes[0].inputQueue.length - 1] 
                    : snakes[0].velocity;
                
                if (input.direction === 'up' && lastVel.y === 0) {
                    if (snakes[0].inputQueue.length < 2) snakes[0].inputQueue.push({x: 0, y: -1});
                } else if (input.direction === 'down' && lastVel.y === 0) {
                    if (snakes[0].inputQueue.length < 2) snakes[0].inputQueue.push({x: 0, y: 1});
                } else if (input.direction === 'left' && lastVel.x === 0) {
                    if (snakes[0].inputQueue.length < 2) snakes[0].inputQueue.push({x: -1, y: 0});
                } else if (input.direction === 'right' && lastVel.x === 0) {
                    if (snakes[0].inputQueue.length < 2) snakes[0].inputQueue.push({x: 1, y: 0});
                }
            }
            return;
        }
        
        // 暂停界面
        if (uiState === 'paused') {
            if (input.directionChanged) {
                if (input.direction === 'up') {
                    pauseMenuIndex = (pauseMenuIndex - 1 + 4) % 4;
                    updatePauseMenu();
                    SoundSystem.play('uiSelect');
                } else if (input.direction === 'down') {
                    pauseMenuIndex = (pauseMenuIndex + 1) % 4;
                    updatePauseMenu();
                    SoundSystem.play('uiSelect');
                }
                setCooldown();
            }
            if (input.confirm) {
                confirmPauseAction();
                setCooldown();
            }
            if (input.cancel || input.start) {
                togglePause();
                setCooldown();
            }
            return;
        }
        
        // 升级选择界面
        if (uiState === 'levelup') {
            if (input.directionChanged) {
                if (input.direction === 'left') {
                    selectedRewardIndex = (selectedRewardIndex - 1 + levelUpChoices.length) % levelUpChoices.length;
                    renderLevelUpCards();
                    SoundSystem.play('uiSelect');
                } else if (input.direction === 'right') {
                    selectedRewardIndex = (selectedRewardIndex + 1) % levelUpChoices.length;
                    renderLevelUpCards();
                    SoundSystem.play('uiSelect');
                }
                setCooldown();
            }
            if (input.confirm) {
                selectLevelUpReward(levelUpChoices[selectedRewardIndex]);
                setCooldown();
            }
            return;
        }
        
        // 百科全书
        if (uiState === 'encyclopedia') {
            if (input.directionChanged) {
                if (input.direction === 'right') {
                    wikiIndex = (wikiIndex + 1) % wikiItems.length;
                } else if (input.direction === 'left') {
                    wikiIndex = (wikiIndex - 1 + wikiItems.length) % wikiItems.length;
                } else if (input.direction === 'down') {
                    wikiIndex = (wikiIndex + 4) % wikiItems.length;
                } else if (input.direction === 'up') {
                    wikiIndex = (wikiIndex - 4 + wikiItems.length) % wikiItems.length;
                }
                renderWikiGrid();
                updateWikiDetails();
                SoundSystem.play('uiSelect');
                setCooldown();
            }
            if (input.cancel) {
                closeEncyclopedia();
                setCooldown();
            }
            return;
        }
        
        // 游戏结束界面
        if (uiState === 'gameover') {
            if (input.confirm) {
                const invPanel = document.getElementById('inventory-panel');
                if(invPanel) invPanel.style.display = 'none';
                goToCharSelect();
                setCooldown();
            }
            return;
        }
    }

    function loop() {
        if (isPaused) {
            // 暂停时也轮询手柄
            handleGamepadInput();
            gameLoopId = requestAnimationFrame(loop);
            return;
        }
        gameLoopId = requestAnimationFrame(loop);
        frameCount++;
        
        // 轮询手柄输入
        handleGamepadInput();

        // Heavy Cannon Movement Penalty
        let speedVal = 8 - Math.floor(level / 5);
        if (difficulty === 'easy') speedVal = Math.floor(speedVal * 2); 
        
        const baseSpeed = Math.max(3, speedVal); 
        const heavyStack = getWeaponStack('heavy');
        const rapidStack = getWeaponStack('rapid');
        
        let moveDelay = baseSpeed * (1 + 0.1 * heavyStack); 
        if (rapidStack > 0) {
            moveDelay *= Math.pow(0.9, rapidStack); 
        }
        moveDelay = Math.max(2, Math.floor(moveDelay));
        
        if (devourTimer > 0) devourTimer--;
        if (invincibleTimer > 0) invincibleTimer--;

        const heartLevel = getPassiveStack('hp');
        if (heartLevel > 0) {
            regenTimer++;
            if (regenTimer >= 300) { 
                regenTimer = 0;
                if (currentHp < maxHp) {
                    const healAmount = maxHp * 0.05; 
                    currentHp = Math.min(maxHp, currentHp + healAmount);
                    updateHud();
                }
            }
        }
    
        if (frameCount % moveDelay === 0) update(moveDelay);
        updateBullets();
        magnetizeItems(); 
        
        if (invincibleTimer > 0 && hasSideCannon()) {
            snakes.forEach(snake => {
                const head = snake.body[0];
                const repelDist = 3;
                for (let i = 0; i < worldObjects.items.length; i++) {
                    const item = worldObjects.items[i];
                    if (item.type === 'walker' && !item.dead) {
                        const dist = Math.abs(item.x - head.x) + Math.abs(item.y - head.y);
                        if (dist < repelDist) {
                            const dx = Math.sign(item.x - head.x);
                            const dy = Math.sign(item.y - head.y);
                            let tx = item.x + (dx || (Math.random()>0.5?1:-1)); 
                            let ty = item.y + (dy || (Math.random()>0.5?1:-1));
                            if (!isBlocked(tx, ty) && !isSnakeBody(tx, ty)) {
                                item.x = tx; item.y = ty;
                            }
                        }
                    }
                }
            });
        }
    
        draw();
    }

    function magnetizeItems() {
        if (frameCount % 5 !== 0) return; 
        const magnetLevel = getPassiveTotal('pickupRange');
        if (magnetLevel === 0) return;
        const range = 1.5 + (magnetLevel - 1) * 0.5; 
        
        const pullEntity = (list: any[], isPickup: boolean) => {
            for (let i = list.length - 1; i >= 0; i--) {
                const item = list[i];
                if (item.type === 'walker') continue;
                
                let closestHead = snakes[0].body[0];
                let minDist = 9999;
                
                snakes.forEach(s => {
                    const d = Math.hypot(item.x - s.body[0].x, item.y - s.body[0].y);
                    if (d < minDist) { minDist = d; closestHead = s.body[0]; }
                });

                if (minDist <= range) {
                    if (minDist > 0.5) {
                        const dx = Math.sign(closestHead.x - item.x);
                        const dy = Math.sign(closestHead.y - item.y);
                        if (!isBlocked(item.x + dx, item.y + dy)) { item.x += dx; item.y += dy; } 
                        else if (!isBlocked(item.x + dx, item.y)) { item.x += dx; } 
                        else if (!isBlocked(item.x, item.y + dy)) { item.y += dy; }
                    }
                    
                    // Fix: Consume immediately if close enough to avoid "following" artifact
                    const distAfter = Math.hypot(item.x - closestHead.x, item.y - closestHead.y);
                    if (distAfter < 0.8) {
                         if (isPickup) {
                             // Treasure chest - trigger 3-choice selection
                             list.splice(i, 1);
                             createParticles(closestHead.x, closestHead.y, '#d4af37', 5);
                             SoundSystem.play('pickup');
                             triggerChestSelection();
                         } else {
                             // Food logic
                             let consumed = false;
                             if (item.type === 'sheep') {
                                const devourLevel = getPassiveTotal('devour');
                                // 基础回血5，贪婪额外回复10% * devourLevel的最大生命值
                                let healAmount = 5;
                                if (devourLevel > 0) {
                                    healAmount += Math.floor(maxHp * 0.1 * devourLevel);
                                    const xpMult = 1 + ((devourLevel-1) * 0.5); 
                                    gainXp(Math.floor(5 * xpMult));
                                }
                                currentHp = Math.min(maxHp, currentHp + healAmount);
                                score += 10; consumed = true;
                                magnetGrowPending++; // 磁铁吸附食物时身体增长
                                createParticles(closestHead.x, closestHead.y, '#f00', 5);
                                SoundSystem.play('pickup');
                             } else if (item.type === 'wildfire') {
                                const learnerBonus = 1 + getPassiveTotal('learner');
                                gainXp(2 * learnerBonus);
                                score += 25; consumed = true;
                                magnetGrowPending++; // 磁铁吸附食物时身体增长
                                createParticles(closestHead.x, closestHead.y, C_FOOD_WILDFIRE, 8); 
                                SoundSystem.play('pickup');
                             }
                             
                             if (consumed) list.splice(i, 1);
                         }
                    }
                }
            }
        };
        pullEntity(worldObjects.pickups, true);
        pullEntity(worldObjects.items, false);
    }
    
    function hasSideCannon() {
        return weaponInventory.some(w => w.type === 'side');
    }
    
    function isSnakeBody(x: number, y: number) {
        for(let s of snakes) {
            for (let i = 1; i < s.body.length; i++) {
                if (s.body[i].x === x && s.body[i].y === y) return true;
            }
        }
        return false;
    }

    function handleItemCollision(itemIndex: number, checkHead: any, isPreMove: boolean) {
        const item = worldObjects.items[itemIndex];
        let consumed = false;

        if (item.type === 'sheep') {
            const devourLevel = getPassiveTotal('devour');
            // 基础回血5，贪婪额外回复10% * devourLevel的最大生命值
            let healAmount = 5;
            if (devourLevel > 0) {
                healAmount += Math.floor(maxHp * 0.1 * devourLevel);
                const xpMult = 1 + ((devourLevel-1) * 0.5); 
                gainXp(Math.floor(5 * xpMult));
            }
            currentHp = Math.min(maxHp, currentHp + healAmount);
            score += 10; consumed = true;
            createParticles(checkHead.x, checkHead.y, '#f00', 5);
            SoundSystem.play('pickup');
            
            worldObjects.items.splice(itemIndex, 1);
        } 
        else if (item.type === 'wildfire') {
            const learnerBonus = 1 + getPassiveTotal('learner');
            gainXp(2 * learnerBonus);
            score += 25; consumed = true;
            createParticles(checkHead.x, checkHead.y, C_FOOD_WILDFIRE, 8); 
            SoundSystem.play('pickup');
            worldObjects.items.splice(itemIndex, 1);
        } 
        else if (item.type === 'walker') {
            const devourLevel = getPassiveTotal('devour');
            if (devourLevel > 0 && devourTimer <= 0) {
                createParticles(checkHead.x, checkHead.y, '#ff00ff', 10); 
                SoundSystem.play('eat');
                // 回复10% * devourLevel的最大生命值
                const healAmount = Math.floor(maxHp * 0.1 * devourLevel);
                currentHp = Math.min(maxHp, currentHp + healAmount);
                const xpMult = 1 + ((devourLevel-1) * 0.5); 
                gainXp(Math.floor(5 * xpMult)); 
                score += 50;
                const cooldownReduc = 1 - (0.15 * (devourLevel - 1));
                devourTimer = Math.floor(DEVOUR_COOLDOWN_BASE * Math.max(0.2, cooldownReduc));
                worldObjects.items.splice(itemIndex, 1);
                consumed = true; 
            } else {
                takeDamage(20, 'enemy'); 
                createParticles(checkHead.x, checkHead.y, '#fff', 5);
                worldObjects.items.splice(itemIndex, 1); 
            }
        }
        return consumed;
    }

    function update(currentDelay: number) {
        // Update input for all snakes
        snakes.forEach(s => {
            if (s.inputQueue.length > 0) s.velocity = s.inputQueue.shift()!;
        });
    
        updateAI();

        const baseImpactDmg = 20;
        const speedFactor = 10 / Math.max(1, currentDelay); 
        const impactDamage = Math.floor(baseImpactDmg * Math.max(1, speedFactor * 0.5));
        const currentSpeed = Math.max(3, 8 - Math.floor(level / 5));
    
        if (boss && !boss.dead) {
            if (boss.dashTrail && frameCount % 5 === 0) {
                boss.dashTrail.shift();
            }

            // Check Boss vs All Snakes
            snakes.forEach(s => {
                const head = s.body[0];
                const headGX = Math.floor(head.x / ROOM_WIDTH);
                const headGY = Math.floor(head.y / ROOM_HEIGHT);

                if (head.x >= boss.x && head.x < boss.x + boss.w &&
                    head.y >= boss.y && head.y < boss.y + boss.h) {
                     takeDamage(impactDamage, 'enemy');
                     createParticles(head.x, head.y, '#fff', 5);
                }
        
                for (let i = 1; i < s.body.length; i++) {
                    if (s.body[i].x >= boss.x && s.body[i].x < boss.x + boss.w &&
                        s.body[i].y >= boss.y && s.body[i].y < boss.y + boss.h) {
                        if (hasSideCannon()) {
                            takeDamage(10, 'enemy'); 
                            createParticles(s.body[i].x, s.body[i].y, '#ccc', 5);
                        } else {
                            takeDamage(10, 'enemy');
                        }
                    }
                }
                
                if (headGX === boss.roomGX && headGY === boss.roomGY) {
                    if (!bossRoomLocked && !boss.spawned) {
                        lockRoom(boss.roomGX, boss.roomGY);
                        const bossWarn = document.getElementById('boss-warning');
                        if(bossWarn) bossWarn.style.display = 'block';
                    }
                    if (!boss.spawned) {
                        createParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ff0000', 2);
                        boss.spawnTimer -= currentSpeed; 
                        if (boss.spawnTimer <= 0) {
                            boss.spawned = true;
                            boss.active = true;
                            const bossWarn = document.getElementById('boss-warning');
                            if(bossWarn) bossWarn.style.display = 'none';
                            const bossHp = document.getElementById('boss-hp-container');
                            if(bossHp) bossHp.style.display = 'flex'; 
                            const bossName = document.getElementById('boss-name');
                            if(bossName) bossName.innerText = boss.name;
                            createParticles(boss.x, boss.y, boss.color, 50);
                            showToast(getText('bossAppeared'), "☠️", true);
                            SoundSystem.play('uiConfirm');
                        }
                    }
                }
            });
        }
    
        weaponInventory.forEach(w => {
            const speedMod = getPassiveTotal('speedMod');
            let delay = Math.max(5, w.rate - (speedMod * 10));
            const berserkLevel = getPassiveTotal('berserk');
            if (berserkLevel > 0) {
                const missingHpPct = 1 - (currentHp / maxHp);
                const berserkReduction = delay * (missingHpPct * berserkLevel);
                delay = Math.max(2, delay - berserkReduction);
            }
            if (frameCount - w.lastShot > delay) {
                fireWeapon(w);
                w.lastShot = frameCount;
            }
        });

        // ----------------- SNAKE MOVEMENT LOOP -----------------
        let globalGrew = false;
        
        snakes.forEach(snake => {
             const curHead = snake.body[0];
             let grewThisFrame = false;

             // Pickups
             for (let i = worldObjects.pickups.length - 1; i >= 0; i--) {
                const p = worldObjects.pickups[i];
                if (p.x === curHead.x && p.y === curHead.y) {
                     if (tryPickup(p)) {
                         worldObjects.pickups.splice(i, 1);
                         createParticles(curHead.x, curHead.y, '#d4af37', 5);
                     }
                }
            }

            // Items
            let curItemIndex = worldObjects.items.findIndex((i: any) => 
                curHead.x >= i.x && curHead.x < i.x + (i.w || 1) &&
                curHead.y >= i.y && curHead.y < i.y + (i.h || 1)
            );
            if (curItemIndex !== -1) {
                const consumed = handleItemCollision(curItemIndex, curHead, true);
                if (consumed) grewThisFrame = true;
            }
            
            if (grewThisFrame) globalGrew = true;
        });

        // Calculate Next Heads
        const nextHeads = snakes.map(s => ({
            x: s.body[0].x + s.velocity.x,
            y: s.body[0].y + s.velocity.y
        }));

        // Room Transition Check (If ANY snake exits)
        let switchedRoom = false;
        let switchDir = {x: 0, y: 0};
        let triggeringSnakeIndex = -1;

        for(let i=0; i<nextHeads.length; i++) {
            const head = nextHeads[i];
            const roomGX = Math.floor(head.x / ROOM_WIDTH);
            const roomGY = Math.floor(head.y / ROOM_HEIGHT);
            const roomKey = `${roomGX},${roomGY}`;

            if (rooms[roomKey]) {
                // Moving into valid room
            } else {
                // Moving into wall or void, handled later by collision
                continue;
            }
            
            // Check if room changed
            const oldRoomKey = `${Math.floor(snakes[i].body[0].x / ROOM_WIDTH)},${Math.floor(snakes[i].body[0].y / ROOM_HEIGHT)}`;
            if (roomKey !== oldRoomKey) {
                switchedRoom = true;
                triggeringSnakeIndex = i;
                switchDir = snakes[i].velocity;
                currentRoomKey = roomKey;
                if(rooms[currentRoomKey]) rooms[currentRoomKey].explored = true;
                break;
            }
        }

        if (switchedRoom) {
            // TELEPORT ALL SNAKES
            const [newGX, newGY] = currentRoomKey.split(',').map(Number);
            const baseOffsetX = newGX * ROOM_WIDTH;
            const baseOffsetY = newGY * ROOM_HEIGHT;
            const midX = Math.floor(ROOM_WIDTH / 2);
            const midY = Math.floor(ROOM_HEIGHT / 2);

            snakes.forEach((s, idx) => {
                let spawnX = baseOffsetX + midX;
                let spawnY = baseOffsetY + midY;
                
                // Offset spawn slightly based on direction so we are "entering"
                if (switchDir.x === 1) { spawnX = baseOffsetX + 1; spawnY = baseOffsetY + midY; } // Entered from Left
                else if (switchDir.x === -1) { spawnX = baseOffsetX + ROOM_WIDTH - 2; spawnY = baseOffsetY + midY; } // Entered from Right
                else if (switchDir.y === 1) { spawnX = baseOffsetX + midX; spawnY = baseOffsetY + 1; } // Entered from Top
                else if (switchDir.y === -1) { spawnX = baseOffsetX + midX; spawnY = baseOffsetY + ROOM_HEIGHT - 2; } // Entered from Bottom
                
                // Separate multiple snakes slightly
                if (idx === 1) {
                    if (switchDir.x !== 0) spawnY += 2;
                    else spawnX += 2;
                }

                // Move entire body to new location to prevent trailing segments in old room
                const deltaX = spawnX - s.body[0].x;
                const deltaY = spawnY - s.body[0].y;
                s.body = s.body.map(seg => ({ x: seg.x + deltaX, y: seg.y + deltaY }));
                
                // Keep velocity
                s.lastDir = { ...s.velocity };
            });
            return; // Skip normal update this frame
        }

        // Normal Movement & Collision for each snake
        snakes.forEach((snake, idx) => {
            const head = nextHeads[idx];
            const roomGX = Math.floor(head.x / ROOM_WIDTH);
            const roomGY = Math.floor(head.y / ROOM_HEIGHT);
            const roomKey = `${roomGX},${roomGY}`;

            let hitSolidEnemy = false;
            if (boss && boss.active) {
                if (head.x >= boss.x && head.x < boss.x + boss.w &&
                    head.y >= boss.y && head.y < boss.y + boss.h) {
                    hitSolidEnemy = true;
                    takeDamage(impactDamage, 'enemy');
                }
            }
    
            if (!hitSolidEnemy) {
                let hitEnemyIdx = worldObjects.items.findIndex((i: any) => 
                    head.x >= i.x && head.x < i.x + (i.w || 1) &&
                    head.y >= i.y && head.y < i.y + (i.h || 1) && 
                    i.type === 'walker' && !i.dead
                );
                if (hitEnemyIdx !== -1) {
                    const devourLevel = getPassiveTotal('devour');
                    if (devourLevel > 0 && devourTimer <= 0) {
                        // pass
                    } else {
                        hitSolidEnemy = true;
                        takeDamage(impactDamage, 'enemy');
                    }
                }
            }

            // Wall/Obstacle Collision
            if (!rooms[roomKey] || worldObjects.walls.has(packKey(head.x, head.y)) || hitSolidEnemy) {
                if (!hitSolidEnemy) takeDamage(impactDamage, 'wall'); 
                if (snake.velocity.x !== 0 || snake.velocity.y !== 0) {
                     snake.lastDir = { ...snake.velocity };
                }
                return; // Snake stops moving
            }

            if (snake.velocity.x !== 0 || snake.velocity.y !== 0) {
                snake.lastDir = { ...snake.velocity };
            }

            // Pickup (Head)
            for (let i = worldObjects.pickups.length - 1; i >= 0; i--) {
                const p = worldObjects.pickups[i];
                if (p.x === head.x && p.y === head.y) {
                    if (tryPickup(p)) {
                        worldObjects.pickups.splice(i, 1);
                        createParticles(head.x, head.y, '#d4af37', 5);
                    }
                }
            }

            // Crates
            let hitCrateIdx = worldObjects.crates.findIndex((c: any) => c.x === head.x && c.y === head.y);
            if (hitCrateIdx !== -1) {
                worldObjects.crates.splice(hitCrateIdx, 1);
                createParticles(head.x, head.y, '#8b5a2b', 6);
                SoundSystem.play('hit');
                if (getPassiveTotal('defense') === 0) takeDamage(Math.floor(impactDamage/2), 'wall');
                checkMinerProc();
                const baseDrop = 0.03;
                const luckyBonus = getPassiveTotal('lucky');
                if (Math.random() < (baseDrop + luckyBonus)) dropItem(head.x, head.y);
            }

            // Exit Portal
            if (exitPortal && head.x === exitPortal.x && head.y === exitPortal.y) {
                if (floor < MAX_FLOORS) {
                    floor++;
                    startFloor();
                    SoundSystem.play('levelup');
                } else {
                    gameVictory();
                }
                return;
            }

            // Self Collision (vs ALL snakes)
            let selfHit = false;
            snakes.forEach(otherSnake => {
                for (let i = 0; i < otherSnake.body.length; i++) {
                    if (head.x === otherSnake.body[i].x && head.y === otherSnake.body[i].y) {
                        selfHit = true; break;
                    }
                }
            });
            if (selfHit) { takeDamage(10, 'self'); return; }

            // Item/Enemy Collision
            let itemIndex = worldObjects.items.findIndex((i: any) => 
                head.x >= i.x && head.x < i.x + (i.w || 1) &&
                head.y >= i.y && head.y < i.y + (i.h || 1)
            );
            let ate = false;
        
            if (itemIndex !== -1) {
                const consumed = handleItemCollision(itemIndex, head, false);
                if (consumed) ate = true;
            }

            // Move Body
            snake.body.unshift(head);
            
            let shouldPop = true;
            // 磁铁吸附食物时的身体增长
            if (magnetGrowPending > 0) {
                magnetGrowPending--;
                shouldPop = false;
            }
            if (ate) shouldPop = false;

            const dietStack = getPassiveStack('diet');
            if (dietStack > 0) {
                if (snake.body.length > 3) {
                    snake.body.pop(); 
                } else {
                    // Only remove diet if BOTH are short? Or just remove once.
                    // Let's remove if triggered.
                    removeItemStack('diet', false);
                    showToast(getText('slimDone'), "✨");
                    updateInventoryUI();
                }
            }
            if (shouldPop) snake.body.pop();
        });
        
        updateHud();
    }

    function getPassiveTotal(statName: string) {
        let total = 0;
        passiveInventory.forEach(p => {
            if (p.stat === statName) total += (p.val * p.stack);
        });
        return total;
    }

    function tryPickup(p: any) {
        if (p.type === 'chest') {
            // 宝箱：触发三选一界面
            triggerLevelUpSelection();
            SoundSystem.play('pickup');
            return true;
        } else if (p.type === 'weapon') {
            const existing = weaponInventory.find(w => w.id === p.data.id);
            const itemName = p.data.nameKey ? getText(p.data.nameKey) : p.data.name;
            if (existing) {
                existing.stack++;
                const upgText = getText('upgraded');
                showToast(`${itemName} ${upgText} (x${existing.stack})`, p.data);
                SoundSystem.play('pickup');
            } else {
                if (weaponInventory.length >= MAX_SLOTS) {
                    showToast(getText('bagFull'), "🚫", true);
                    return false;
                }
                addWeapon(p.data);
                const gotText = getText('gotWeapon');
                showToast(`${gotText} ${itemName}`, p.data);
                SoundSystem.play('pickup');
            }
        } else if (p.type === 'passive') {
            const existing = passiveInventory.find(pass => pass.id === p.data.id);
            const itemName = p.data.nameKey ? getText(p.data.nameKey) : p.data.name;
            if (existing) {
                existing.stack++;
                applyPassiveStack(existing);
                const upgText = getText('upgraded');
                showToast(`${itemName} ${upgText} (x${existing.stack})`, p.data);
                SoundSystem.play('pickup');
            } else {
                if (passiveInventory.length >= MAX_SLOTS) {
                    showToast(getText('bagFull'), "🚫", true);
                    return false;
                }
                addPassive(p.data);
                const gotText = getText('gotPassive');
                showToast(`${gotText} ${itemName}`, p.data);
                SoundSystem.play('pickup');
            }
        }
        updateInventoryUI();
        return true;
    }

    function addWeapon(data: any) {
        weaponInventory.push({ ...data, stack: 1, lastShot: 0 });
    }

    function addPassive(data: any) {
        const newItem = { ...data, stack: 1 };
        passiveInventory.push(newItem);
        applyPassiveStack(newItem); 
    }

    function applyPassiveStack(item: any) {
        if (item.stat === 'hpBonus') {
            maxHp += item.val;
            currentHp += (item.val / 2); 
        }
        if (item.stat === 'diet') {
            snakes.forEach(s => {
                if (s.body.length > 1) {
                    s.body.pop();
                }
            });
            showToast(getText('bodyShrink'), "🥒");
        }
    }

    function showToast(text: string, iconOrItem: string | any, important: boolean = false) {
        // 只显示重要提示（BOSS相关、背包已满等）
        if (!important) return;
        
        const el = document.getElementById('toast');
        if (el) {
            // Check if it's an item with img property
            const iconHtml = (typeof iconOrItem === 'object' && iconOrItem.img) 
                ? renderIcon(iconOrItem, 24) 
                : `<span style="font-size:20px; margin-right:5px;">${iconOrItem}</span>`;
            el.innerHTML = `${iconHtml} ${text}`;
            el.classList.add('show');
            setTimeout(() => { el.classList.remove('show'); }, 2000);
        }
    }
    
    const getStatLabel = (stat: string) => {
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        const mapZh: any = {
            damagePercent: '伤害加成', defense: '防御力', hpBonus: '生命上限',
            speedMod: '攻速/移速', pickupRange: '拾取范围', berserk: '狂暴效果',
            devour: '吞噬能力', bounce: '反弹次数', lucky: '幸运值',
            miner: '挖掘经验', learner: '经验加成', crit: '暴击率',
            pierce: '穿透次数', diet: '瘦身效果', mouseAim: '鼠标瞄准', stealth: '潜行等级'
        };
        const mapEn: any = {
            damagePercent: 'DMG Bonus', defense: 'Defense', hpBonus: 'Max HP',
            speedMod: 'ATK/Move SPD', pickupRange: 'Pickup Range', berserk: 'Berserk',
            devour: 'Devour', bounce: 'Bounces', lucky: 'Luck',
            miner: 'Mining XP', learner: 'XP Bonus', crit: 'Crit Rate',
            pierce: 'Pierce', diet: 'Diet', mouseAim: 'Mouse Aim', stealth: 'Stealth'
        };
        const map = isEn ? mapEn : mapZh;
        return map[stat] || stat;
    };

    function updateInventoryUI() {
        const wContainer = document.getElementById('inv-weapons');
        const pContainer = document.getElementById('inv-passives');
        if(!wContainer || !pContainer) return;
        const tooltip = document.getElementById('inv-tooltip');
        
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';

        const createSlot = (item: any) => {
            const div = document.createElement('div');
            div.className = 'inv-item';
            if (item) {
                div.innerHTML = `${renderIcon(item, 36)}<span class="inv-count">${item.stack > 1 ? 'x'+item.stack : ''}</span>`;
                div.classList.add('filled');
                div.style.cursor = 'pointer';
                
                // 点击道具槽时，如果在百科全书模式，同步高亮
                div.onclick = () => {
                    if (uiState === 'encyclopedia' || uiState === 'paused') {
                        // 查找该道具在 wikiItems 中的索引
                        const idx = wikiItems.findIndex((w: any) => w.id === item.id);
                        if (idx !== -1) {
                            // 如果不在百科全书模式，先打开
                            if (uiState === 'paused') {
                                openEncyclopedia();
                            }
                            wikiIndex = idx;
                            renderWikiGrid();
                            updateWikiDetails();
                            SoundSystem.play('uiSelect');
                        }
                    }
                };
                
                div.onmouseenter = (e) => {
                    if(tooltip) {
                        // 获取翻译后的名称和描述
                        const itemName = item.nameKey ? getText(item.nameKey) : item.name;
                        const itemDesc = item.descKey ? getText(item.descKey) : item.desc;
                        
                        let stats = "";
                        if (item.type !== undefined) { 
                            const weaponStackMult = 1 + 0.2 * (item.stack - 1);
                            const dragonDmgMult = dragonStats[p1Char].dmgMod; // Approx display
                            const passivePercent = getPassiveTotal('damagePercent');
                            const baseDmg = (item.damage * weaponStackMult * dragonDmgMult) * (1 + passivePercent);

                            const speedMod = getPassiveTotal('speedMod');
                            const fireRate = Math.max(5, item.rate - (speedMod * 10));
                            const shotsPerSec = (60/fireRate).toFixed(1);

                            const baseDmgLabel = getText('baseDmg');
                            const currDmgLabel = getText('currDmg');
                            const rateLabel = getText('fireRate');
                            stats += `<div>${baseDmgLabel}: ${item.damage}</div>`;
                            stats += `<div style="color:#0ff">${currDmgLabel}: ${Math.floor(baseDmg)}</div>`;
                            stats += `<div>${rateLabel}: ${shotsPerSec}/s</div>`;
                        } else { 
                            const label = getStatLabel(item.stat);
                            const attrLabel = getText('statLabel');
                            const perLvLabel = getText('perLvLabel');
                            const totalLabel = getText('totalLabel');
                            stats += `<div>${attrLabel}: ${label}</div>`;
                            stats += `<div>${perLvLabel}: ${item.val}</div>`;
                            stats += `<div style="color:#0ff">${totalLabel}: ${Number((item.val * item.stack).toFixed(2))}</div>`;
                        }
                        tooltip.innerHTML = `
                            <div style="color:${item.color || '#fff'}; font-weight:bold; margin-bottom:5px; font-size:${isEn ? '11px' : '12px'};">${itemName}</div>
                            <div style="font-size:${isEn ? '9px' : '10px'}; color:#aaa; margin-bottom:5px;">${itemDesc}</div>
                            <div style="font-size:${isEn ? '9px' : '10px'}; color:#ccc;">${stats}</div>
                            <div style="font-size:${isEn ? '9px' : '10px'}; color:#666; margin-top:5px;">Lv.${item.stack}</div>
                        `;
                        tooltip.style.display = 'block';
                        const rect = div.getBoundingClientRect();
                        const panelRect = document.getElementById('inventory-panel')!.getBoundingClientRect();
                        tooltip.style.left = `${rect.left - panelRect.left}px`;
                        tooltip.style.bottom = '60px'; 
                    }
                };
                div.onmouseleave = () => {
                    if(tooltip) tooltip.style.display = 'none';
                };
            } else div.style.opacity = '0.3';
            return div;
        };

        wContainer.innerHTML = '';
        for(let i=0; i<MAX_SLOTS; i++) wContainer.appendChild(createSlot(weaponInventory[i]));
        pContainer.innerHTML = '';
        for(let i=0; i<MAX_SLOTS; i++) pContainer.appendChild(createSlot(passiveInventory[i]));
    }

    function fireWeapon(w: any) {
        // Fire for EACH snake (they share the weapon capability)
        snakes.forEach(snake => {
            const head = snake.body[0];
            const dragonDmgMult = dragonStats[snake.type].dmgMod;
            const weaponStackMult = 1 + 0.2 * (w.stack - 1); 
            const passivePercent = getPassiveTotal('damagePercent'); 
            
            const critChance = getPassiveTotal('crit');
            let isCrit = Math.random() < critChance;
            let finalDmg = (w.damage * weaponStackMult * dragonDmgMult) * (1 + passivePercent);
            if (isCrit) finalDmg *= 2;
        
            if (w.type === 'side') {
                SoundSystem.play('shoot_side');
                const bounces = getPassiveTotal('bounce');
                for(let i=1; i<snake.body.length; i+=2) {
                    const curr = snake.body[i];
                    const prev = snake.body[i-1]; 
                    
                    let dirX = prev.x - curr.x;
                    let dirY = prev.y - curr.y;
                    if (dirX !== 0) dirX = Math.sign(dirX);
                    if (dirY !== 0) dirY = Math.sign(dirY);
        
                    const leftX = dirY; const leftY = -dirX;
                    const rightX = -dirY; const rightY = dirX;

                    // Apply weapon speed to side cannons too
                    const speed = w.speed || 1;
        
                    spawnBullet(leftX * speed, leftY * speed, w, finalDmg, isCrit, curr.x, curr.y);
                    spawnBullet(rightX * speed, rightY * speed, w, finalDmg, isCrit, curr.x, curr.y);
                }
                return;
            }

            const sideStack = getWeaponStack('side');
            if (sideStack > 0) {
                finalDmg *= Math.max(0.1, 1 - (0.2 * sideStack));
            }
        
            let shootDx = 0, shootDy = 0;
            const hasAim = getPassiveStack('aim') > 0;
            // P1 supports mouse aim. P2 does not (keyboard only).
            // Simplification: Mouse aim applies to P1 only, or closest snake? 
            // Let's make Aim P1 only for now as mouse is singular.
            
            if (hasAim && mouseRef.current && snake.id === 1) {
                const [crX, crY] = currentRoomKey.split(',').map(Number);
                
                const screenHeadX = (head.x - (crX * ROOM_WIDTH)) * gridSize + gridSize/2;
                const screenHeadY = (head.y - (crY * ROOM_HEIGHT)) * gridSize + gridSize/2 + MAP_OFFSET_Y;
                
                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;
                const dx = mx - screenHeadX;
                const dy = my - screenHeadY;
                const mag = Math.hypot(dx, dy);
                
                if (mag > 0) { shootDx = dx / mag; shootDy = dy / mag; }
                else { shootDx = snake.lastDir.x; shootDy = snake.lastDir.y; }
            } else {
                if (snake.velocity.x !== 0 || snake.velocity.y !== 0) { shootDx = snake.velocity.x; shootDy = snake.velocity.y; } 
                else { shootDx = snake.lastDir.x; shootDy = snake.lastDir.y; }
            }

            // Apply Weapon Speed
            const projectileSpeed = w.speed || 1;
            shootDx *= projectileSpeed;
            shootDy *= projectileSpeed;
            
            if (w.type === 'triple') {
                SoundSystem.play('shoot_shotgun');
                if (hasAim && snake.id === 1) {
                    spawnBullet(shootDx, shootDy, w, finalDmg, isCrit, head.x, head.y);
                    const angle = 0.35;
                    const cos = Math.cos(angle); const sin = Math.sin(angle);
                    const lx = shootDx * cos - shootDy * sin;
                    const ly = shootDx * sin + shootDy * cos;
                    spawnBullet(lx, ly, w, finalDmg, isCrit, head.x, head.y);
                    const rx = shootDx * cos + shootDy * sin;
                    const ry = -shootDx * sin + shootDy * cos;
                    spawnBullet(rx, ry, w, finalDmg, isCrit, head.x, head.y);
                } else {
                    spawnBullet(shootDx, shootDy, w, finalDmg, isCrit, head.x, head.y);
                    // Standard triple shot uses fixed directions relative to movement if not aimed
                    // But if we want consistent speed, we should rely on shootDx/Dy which are already scaled.
                    // However, the logic below forces hardcoded directions (e.g. {shootDx, 1}).
                    // We need to apply speed there too if we enter this block.
                    // Re-evaluating: 'shootDx' is already scaled.
                    // If moving Right (1*Speed, 0):
                    //   Center: (Speed, 0)
                    //   Top: (Speed, -1) -> Wait, -1 is not scaled!
                    
                    if (Math.abs(shootDx) > 0 && Math.abs(shootDy) < 0.01) { 
                        spawnBullet(shootDx, 1 * projectileSpeed, w, finalDmg, isCrit, head.x, head.y); 
                        spawnBullet(shootDx, -1 * projectileSpeed, w, finalDmg, isCrit, head.x, head.y); 
                    } 
                    else if (Math.abs(shootDx) < 0.01 && Math.abs(shootDy) > 0) { 
                        spawnBullet(1 * projectileSpeed, shootDy, w, finalDmg, isCrit, head.x, head.y); 
                        spawnBullet(-1 * projectileSpeed, shootDy, w, finalDmg, isCrit, head.x, head.y); 
                    }
                    else { 
                        // Diagonal or fallback, simplify to just center for now or standard cross
                        // If diagonal (Speed, Speed):
                        spawnBullet(shootDx, 0, w, finalDmg, isCrit, head.x, head.y); 
                        spawnBullet(0, shootDy, w, finalDmg, isCrit, head.x, head.y); 
                    }
                }

            } else {
                if (w.type === 'heavy') SoundSystem.play('shoot_heavy');
                else if (w.type === 'rapid') SoundSystem.play('shoot_rapid');
                else if (w.type === 'snowball') SoundSystem.play('shoot_ice');
                else if (w.type === 'venom') SoundSystem.play('shoot_venom');
                else if (w.type === 'plasma') SoundSystem.play('shoot_ice'); 
                else SoundSystem.play('shoot');
                
                spawnBullet(shootDx, shootDy, w, finalDmg, isCrit, head.x, head.y);
            }
        });
    }

    function spawnBullet(vx: number, vy: number, weapon: any, dmg: number, isCrit: boolean, sx: number, sy: number) {
        const bounces = getPassiveTotal('bounce');
        const pierceCount = getPassiveTotal('pierce'); 
        worldObjects.bullets.push({
            x: sx, y: sy,
            vx: vx, vy: vy,
            life: 30,
            damage: dmg,
            isHeavy: weapon.type === 'heavy',
            weaponType: weapon.type,
            color: weapon.color,
            bouncesLeft: bounces,
            pierceLeft: pierceCount,
            heavyStack: weapon.type === 'heavy' ? weapon.stack : 0,
            isCrit: isCrit
        });
    }

    function createExplosion(x: number, y: number) {
        for(let i=0; i<20; i++) {
            worldObjects.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                life: 20 + Math.random() * 10,
                color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00' 
            });
        }
    }

    function triggerExplosion(centerX: number, centerY: number, damage: number, extraRadius: number = 0) {
        SoundSystem.play('explode');
        const radius = 1.0 + (extraRadius ? (extraRadius - 1) : 0); 
        
        worldObjects.explosions.push({ x: centerX, y: centerY, life: 15, maxLife: 15, radius: radius });
        createExplosion(centerX, centerY);
    
        for (let i = worldObjects.crates.length - 1; i >= 0; i--) {
            const c = worldObjects.crates[i];
            const dist = Math.hypot(c.x - centerX, c.y - centerY);
            if (dist <= radius) {
                worldObjects.crates.splice(i, 1);
                createParticles(c.x, c.y, '#8b5a2b', 4);
                checkMinerProc();
                const baseDrop = 0.03;
                const luckyBonus = getPassiveTotal('lucky');
                if (Math.random() < (baseDrop+luckyBonus)) dropItem(c.x, c.y);
            }
        }
        
        // ✅ 优化：Set iterator
        worldObjects.walls.forEach((wKey: number) => {
             const {x: wx, y: wy} = unpackKey(wKey);
             const dist = Math.hypot(wx - centerX, wy - centerY);
             if (dist <= radius) { 
                 worldObjects.walls.delete(wKey);
                 checkMinerProc();
                 createParticles(wx, wy, '#4a4a50', 5);
             }
        });
    
        for (let i = worldObjects.items.length - 1; i >= 0; i--) {
            const item = worldObjects.items[i];
            if (item.type === 'walker') {
                const dist = Math.hypot(item.x - centerX, item.y - centerY);
                if (dist <= radius) {
                    item.hp -= damage;
                    createParticles(item.x, item.y, '#fff', 5);
                    if (item.hp <= 0) {
                        dropLootItem(item.x, item.y, 'wildfire');
                        worldObjects.items.splice(i, 1);
                        createParticles(item.x, item.y, C_FOOD_WILDFIRE, 8); 
                        score += 30;
                        if (Math.random() < 0.25) dropItem(item.x, item.y);
                    }
                }
            }
        }
    
        if (boss && boss.active) {
            const bx = boss.x + boss.w/2;
            const by = boss.y + boss.h/2;
            const dist = Math.hypot(bx - centerX, by - centerY);
            if (dist <= radius + (boss.w/2)) damageBoss(damage); 
        }
    }

    function applyStatusToEntity(entity: any, weaponType: string) {
        if (weaponType === 'side') return;
        const checkStatus = (type: string) => {
             if (type === 'ice' && Math.random() < 0.3) {
                entity.frozen = 12; 
                createParticles(entity.x, entity.y, '#00ccff', 2);
            }
            if (type === 'poison') {
                entity.poisoned = 60; entity.poisonTimer = 0;
                createParticles(entity.x, entity.y, '#00ff00', 2);
            }
        };
        checkStatus(p1Char);
        if (numPlayers === 2) checkStatus(p2Char);

        if (weaponType === 'snowball') {
            if (Math.random() < 0.5) {
                entity.frozen = 12; createParticles(entity.x, entity.y, '#ffffff', 2);
            }
        }
        if (weaponType === 'venom') {
            entity.poisoned = 60; entity.poisonTimer = 0;
            createParticles(entity.x, entity.y, '#00ff00', 2);
        }
    }

    function updateBullets() {
        if (frameCount % 2 !== 0) return;
    
        for (let i = worldObjects.bullets.length - 1; i >= 0; i--) {
            let b = worldObjects.bullets[i];
            // 保存上一帧位置用于射线碰撞检测
            const prevX = b.x;
            const prevY = b.y;
            b.x += b.vx; b.y += b.vy; b.life--;
            let hit = false;
            
            // Wall Collision
            // ✅ 优化：使用数字 key + Math.floor
            const floorX = Math.floor(b.x);
            const floorY = Math.floor(b.y);
            const wKey = packKey(floorX, floorY);
            
            if (worldObjects.walls.has(wKey)) {
                if (b.isHeavy) {
                    hit = true;
                    worldObjects.walls.delete(wKey);
                    createParticles(floorX, floorY, '#4a4a50', 5);
                    triggerExplosion(b.x, b.y, b.damage, b.heavyStack || 0);
                    checkMinerProc(); 
                    const luckyBonus = getPassiveTotal('lucky');
                    if (Math.random() < (0.04 + luckyBonus)) dropItem(floorX, floorY);
                } 
                else if (b.pierceLeft > 0) {
                    // ✅ 优化：使用 Map 获取伤害值
                    const currentDmg = (wallDamages.get(wKey) || 0) + b.damage;
                    wallDamages.set(wKey, currentDmg);
                    createParticles(floorX, floorY, '#aaa', 2);
                    
                    if (currentDmg >= 50) { 
                         worldObjects.walls.delete(wKey);
                         createParticles(floorX, floorY, '#4a4a50', 5);
                         wallDamages.delete(wKey);
                         checkMinerProc();
                         const luckyBonus = getPassiveTotal('lucky');
                         if (Math.random() < (0.04 + luckyBonus)) dropItem(floorX, floorY);
                    }
                    
                    b.pierceLeft--; 
                    hit = false; 
                }
                else {
                    hit = true; 
                    if (b.bouncesLeft > 0) {
                        b.x -= b.vx; b.y -= b.vy;
                        if (worldObjects.walls.has(packKey(Math.floor(b.x + b.vx), floorY))) {
                            b.vx = -b.vx;
                        } else {
                            b.vy = -b.vy; 
                        }
                        b.bouncesLeft--;
                        hit = false;
                    }
                }
            }
            
            if (!hit) {
                let cIdx = worldObjects.crates.findIndex((c: any) => 
                    Math.abs(c.x - b.x) < 0.8 && Math.abs(c.y - b.y) < 0.8
                );
                if (cIdx !== -1) {
                    let crate = worldObjects.crates[cIdx];
                    if (!b.isHeavy) {
                        if (!crate.hp) crate.hp = 5; 
                        crate.hp -= b.damage;
                        
                        if (crate.hp <= 0) {
                            worldObjects.crates.splice(cIdx, 1);
                            createParticles(b.x, b.y, '#8b5a2b', 4);
                            SoundSystem.play('hit');
                            const luckyBonus = getPassiveTotal('lucky');
                            if (Math.random() < (0.04 + luckyBonus)) dropItem(b.x, b.y);
                            checkMinerProc(); 
                        } else {
                            createParticles(b.x, b.y, '#8b5a2b', 2);
                        }
                        
                        if (b.pierceLeft > 0) {
                            b.pierceLeft--; hit = false;
                        } else {
                            hit = true;
                        }
                    } else {
                        hit = true; triggerExplosion(b.x, b.y, b.damage, b.heavyStack || 0);
                    }
                }
            }
            
            if (!hit) {
                // 射线碰撞检测：检查子弹从上一位置到当前位置的路径是否穿过敌人
                let eIdx = worldObjects.items.findIndex((it: any) => {
                    if (it.type !== 'walker') return false;
                    const itW = it.w || 1;
                    const itH = it.h || 1;
                    // 检查当前位置
                    if (b.x >= it.x && b.x < it.x + itW && b.y >= it.y && b.y < it.y + itH) return true;
                    // 检查路径上的点（用于快速子弹）
                    const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                    if (speed > 0.5) {
                        const steps = Math.ceil(speed * 2);
                        for (let s = 1; s < steps; s++) {
                            const t = s / steps;
                            const checkX = prevX + (b.x - prevX) * t;
                            const checkY = prevY + (b.y - prevY) * t;
                            if (checkX >= it.x && checkX < it.x + itW && checkY >= it.y && checkY < it.y + itH) return true;
                        }
                    }
                    return false;
                });
                if (eIdx !== -1) {
                    let target = worldObjects.items[eIdx];
                    if (!b.isHeavy) {
                        applyStatusToEntity(target, b.weaponType);
                        target.hp -= b.damage;
                        
                        if (b.isCrit) {
                             worldObjects.particles.push({
                                x: b.x, y: b.y, vx: 0, vy: 0, life: 15, color: '#ff0000', type: 'crit_cross'
                            });
                        } else {
                            createParticles(b.x, b.y, '#fff', 2);
                        }
                        SoundSystem.play('hit');
                        
                        if (b.weaponType === 'plasma') {
                             const plasmaStack = getWeaponStack('plasma');
                             const chainRange = 2 + (plasmaStack > 1 ? (plasmaStack - 1) : 0);
                             SoundSystem.play('zap');
                             worldObjects.items.forEach((other: any) => {
                                 if (other === target || other.type !== 'walker') return;
                                 const dist = Math.abs(other.x - target.x) + Math.abs(other.y - target.y);
                                 if (dist <= chainRange) {
                                     other.hp -= b.damage * 0.5; 
                                     worldObjects.lightning.push({
                                         x1: b.x, y1: b.y, x2: other.x, y2: other.y, life: 8, color: '#00ffff'
                                     });
                                     if(other.hp <= 0 && !other.dead) other.dead = true; 
                                 }
                             });
                        }

                        if (target.hp <= 0) {
                            dropLootItem(target.x, target.y, 'wildfire');
                            worldObjects.items.splice(eIdx, 1);
                            createParticles(b.x, b.y, C_FOOD_WILDFIRE, 8); 
                            score += 30;
                            SoundSystem.play('pickup'); 
                            if (Math.random() < 0.25) dropItem(b.x, b.y);
                        }
                        
                        if (b.pierceLeft > 0) {
                            b.pierceLeft--; hit = false; 
                        } else {
                            hit = true;
                        }
                    } else {
                        hit = true; triggerExplosion(b.x, b.y, b.damage, b.heavyStack || 0);
                    }
                }
            }
            
            if (!hit && boss && boss.active) {
                if (b.x >= boss.x && b.x < boss.x + boss.w &&
                    b.y >= boss.y && b.y < boss.y + boss.h) {
                    if (!b.isHeavy) {
                        damageBoss(b.damage);
                        applyStatusToEntity(boss, b.weaponType);
                        createParticles(b.x, b.y, '#9000ff', 2);
                        if(b.isCrit) {
                             worldObjects.particles.push({
                                x: b.x, y: b.y, vx: 0, vy: 0, life: 15, color: '#ff0000', type: 'crit_cross'
                            });
                        }
                        hit = true;
                    } else {
                        triggerExplosion(b.x, b.y, b.damage, b.heavyStack || 0);
                        hit = true;
                    }
                }
            }
            
            if (hit || b.life <= 0) worldObjects.bullets.splice(i, 1);
        }
        
        for (let i = worldObjects.explosions.length - 1; i >= 0; i--) {
            worldObjects.explosions[i].life--;
            if (worldObjects.explosions[i].life <= 0) worldObjects.explosions.splice(i, 1);
        }
    }

    function updateAI() {
        const stealthLevel = getPassiveStack('mist');
        let detectionRange = 15;
        if (stealthLevel > 0) {
            detectionRange = Math.max(3, 15 - (stealthLevel * 3)); 
        }

        // ✅ 优化：简单循环
        for(let i=0; i<worldObjects.items.length; i++) {
            const item = worldObjects.items[i];
            if (item.type === 'walker') {
                if (item.frozen > 0) { 
                    item.frozen--; 
                    if (item.frozen === 0) createParticles(item.x, item.y, '#fff', 3);
                }
                if (item.poisoned > 0) {
                    item.poisoned--;
                    item.poisonTimer++;
                    if (item.poisonTimer > 6) { 
                        createParticles(item.x, item.y, '#00ff00', 1);
                        item.hp -= 5; 
                        SoundSystem.play('hit');
                        if(item.hp <= 0) item.dead = true;
                        item.poisonTimer = 0;
                    }
                }
    
                if (item.frozen > 0) continue; 
    
                let moveChance = (item.poisoned > 0) ? 0.3 : 0.6;
                let tickMoveChance = moveChance * 0.5; 
                
                if (floor === 3) tickMoveChance *= 2;
    
                // AI Targets closest snake
                let targetSnake = snakes[0];
                let closestDist = 9999;
                snakes.forEach(s => {
                    const dist = Math.abs(item.x - s.body[0].x) + Math.abs(item.y - s.body[0].y);
                    if (dist < closestDist) { closestDist = dist; targetSnake = s; }
                });

                if (closestDist < detectionRange && Math.random() < tickMoveChance) {
                    const head = targetSnake.body[0];
                    const dx = Math.sign(head.x - item.x);
                    const dy = Math.sign(head.y - item.y);
                    let tx = item.x, ty = item.y;
                    
                    let w = item.w || 1;
                    let h = item.h || 1;
    
                    if (Math.random() > 0.5) tx += dx; else ty += dy;
                    
                    let blocked = false;
                    for(let iw=0; iw<w; iw++) {
                        for(let jh=0; jh<h; jh++) {
                            if (isBlocked(tx+iw, ty+jh)) blocked = true;
                        }
                    }
                    
                    if (!blocked) {
                        let hitSnake = false;
                        for(let s of snakes) {
                            for (let k = 0; k < s.body.length; k++) {
                                if (s.body[k].x >= tx && s.body[k].x < tx+w &&
                                    s.body[k].y >= ty && s.body[k].y < ty+h) {
                                    hitSnake = true;
                                    break;
                                }
                            }
                        }
    
                        if (hitSnake) {
                            if (hasSideCannon()) {
                                takeDamage(20, 'enemy'); 
                                item.hp -= (10 + level);
                                createParticles(tx, ty, '#777', 3); 
                                SoundSystem.play('bounce');
                                if(item.hp <= 0) item.dead = true;
                            }
                        } else {
                            item.x = tx; item.y = ty; 
                        }
                    }
                }
            }
        }
    
        for (let i = worldObjects.items.length - 1; i >= 0; i--) {
            if (worldObjects.items[i].dead) {
                dropLootItem(worldObjects.items[i].x, worldObjects.items[i].y, 'wildfire');
                score += 30;
                if (Math.random() < 0.25) dropItem(worldObjects.items[i].x, worldObjects.items[i].y);
                worldObjects.items.splice(i, 1);
            }
        }
        
        if (boss && boss.active) {
            // Boss Dash
            if (floor === 3) {
                if (boss.dashState === 'idle') {
                    boss.dashTimer--;
                    if (boss.dashTimer <= 0) {
                        boss.dashState = 'prepare'; boss.dashTimer = 60; SoundSystem.play('uiSelect'); 
                    }
                } else if (boss.dashState === 'prepare') {
                    boss.dashTimer--;
                    createParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ffaa00', 1); 
                    if (boss.dashTimer <= 0) {
                        boss.dashState = 'dashing';
                        boss.dashTimer = 30; 
                        
                        // Target random snake
                        const target = snakes[Math.floor(Math.random()*snakes.length)].body[0];
                        let dx = target.x - (boss.x + boss.w/2);
                        let dy = target.y - (boss.y + boss.h/2);
                        if (Math.abs(dx) > Math.abs(dy)) boss.dashDir = {x: Math.sign(dx), y: 0};
                        else boss.dashDir = {x: 0, y: Math.sign(dy)};
                        SoundSystem.play('shoot_heavy'); 
                    }
                    return; 
                } else if (boss.dashState === 'dashing') {
                    boss.dashTimer--;
                    let nx = boss.x + boss.dashDir.x;
                    let ny = boss.y + boss.dashDir.y;
                    
                    if(!boss.dashTrail) boss.dashTrail = [];
                    boss.dashTrail.push({x: boss.x, y: boss.y, life: 10});

                    if (!isBlocked(nx, ny) && !isBlocked(nx + boss.w - 1, ny + boss.h - 1)) {
                        boss.x += boss.dashDir.x; boss.y += boss.dashDir.y;
                        createParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#fff', 2);
                    } else {
                        boss.dashTimer = 0; SoundSystem.play('explode'); 
                    }
                    
                    if (boss.dashTimer <= 0) { boss.dashState = 'idle'; boss.dashTimer = 180; }
                    return; 
                }
            }
    
            if (boss.frozen > 0) {
                boss.frozen--;
                if (boss.frozen === 0) createParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#fff', 10);
            }
            if (boss.poisoned > 0) {
                boss.poisoned--; boss.poisonTimer++;
                if (boss.poisonTimer > 6) { 
                    const poisonDmg = (boss.maxHp * 0.005) + 5;
                    damageBoss(poisonDmg); 
                    createParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#00ff00', 5);
                    boss.poisonTimer = 0;
                    SoundSystem.play('hit');
                }
            }
    
            if (boss.frozen > 0) return; 
    
            let moveRate = boss.moveRate;
            if (boss.poisoned > 0) moveRate *= 2; 
    
            if (frameCount % Math.ceil(moveRate) === 0) {
                 const target = snakes[0].body[0]; // Simplification: Chase P1
                 const dx = Math.sign(target.x - (boss.x + Math.floor(boss.w/2)));
                 const dy = Math.sign(target.y - (boss.y + Math.floor(boss.h/2)));
                 let blocked = false;
                 if (isBlocked(boss.x + dx, boss.y + dy)) blocked = true;
                 
                 for(let s of snakes) {
                    for(let i=0; i<s.body.length; i++) {
                         if(s.body[i].x >= boss.x+dx && s.body[i].x < boss.x+dx+boss.w &&
                            s.body[i].y >= boss.y+dy && s.body[i].y < boss.y+dy+boss.h) {
                                blocked = true; break;
                            }
                     }
                 }
                 if (!blocked) { boss.x += dx; boss.y += dy; }
            }
        }
    }

    function damageBoss(dmg: number) {
        if (!boss || !boss.active) return;
        boss.hp -= dmg;
        SoundSystem.play('hit');
        const hpBar = document.getElementById('boss-hp-bar');
        if(hpBar) hpBar.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
        if (boss.hp <= 0) {
            boss.active = false; boss.dead = true; 
            const bossHp = document.getElementById('boss-hp-container');
            if(bossHp) bossHp.style.display = 'none';
            score += 5000;
            exitPortal = { x: boss.x + 1, y: boss.y + 1 };
            createParticles(boss.x + 1, boss.y + 1, '#d000ff', 50);
            showToast(getText('bossDefeated', boss.name), "☠️", true);
            unlockRoom(boss.roomGX, boss.roomGY);
            SoundSystem.play('levelup'); 
        }
    }

    function isBlocked(x: number, y: number) {
        if (worldObjects.walls.has(packKey(x,y))) return true;
        if (worldObjects.crates.some((c: any) => c.x === x && c.y === y)) return true;
        return false;
    }

    function takeDamage(amount: number, source: string) {
        if (invincibleTimer > 0) return; 
        if (source !== 'wall') SoundSystem.play('hit');
        
        const reduction = getPassiveTotal('defense') * 2;
        const finalDmg = Math.max(1, amount - reduction);
        currentHp -= finalDmg;
        
        // Shared invincibility preventing instant drain in Co-op
        invincibleTimer = 30; 
        if (currentHp <= 0) gameOver();
        updateHud();
    }

    function gainXp(amount: number) {
        xp += amount; 
        if (xp >= xpToNextLevel) { 
            level++;
            xp = 0;
            xpToNextLevel = Math.floor(xpToNextLevel * 1.1) + 2; 
            triggerLevelUpSelection();
        }
        updateHud();
    }

    function triggerChestSelection() {
        isPaused = true;
        uiState = 'levelup';
        SoundSystem.play('levelup');
        selectedRewardIndex = 0;
        
        // Build pool from weapons and passives
        let pool: any[] = [];
        const ownedWeaponIds = weaponInventory.map(w => w.id);
        if (weaponInventory.length < MAX_SLOTS) {
            pool = pool.concat(Object.values(WEAPONS).map((w: any) => ({...w, pickupType:'weapon'})));
        } else {
            pool = pool.concat(Object.values(WEAPONS).filter((w: any) => ownedWeaponIds.includes(w.id)).map((w: any) => ({...w, pickupType:'weapon'})));
        }
        
        const ownedPassiveIds = passiveInventory.map(p => p.id);
        if (passiveInventory.length < MAX_SLOTS) {
            pool = pool.concat(PASSIVES.map(p => ({...p, pickupType:'passive'})));
        } else {
            pool = pool.concat(PASSIVES.filter(p => ownedPassiveIds.includes(p.id)).map(p => ({...p, pickupType:'passive'})));
        }
        
        if (pool.length === 0) pool.push({ nameKey: 'maxHeal', icon: '💖', type: 'heal', descKey: 'healAll' });
        
        levelUpChoices = [];
        // Pick 3 random unique items
        const shuffled = pool.sort(() => Math.random() - 0.5);
        for(let i=0; i<Math.min(3, shuffled.length); i++) {
            levelUpChoices.push(shuffled[i]);
        }
        
        renderLevelUpCards();
        document.getElementById('levelup-screen')?.classList.remove('hidden');
        const wikiBtn = document.getElementById('wiki-btn-levelup');
        if(wikiBtn) wikiBtn.onclick = openEncyclopedia;
    }

    function triggerLevelUpSelection() {
        isPaused = true;
        uiState = 'levelup';
        SoundSystem.play('levelup');
        selectedRewardIndex = 0;
        
        let pool: any[] = [];
        const ownedWeaponIds = weaponInventory.map(w => w.id);
        if (weaponInventory.length < MAX_SLOTS) {
            pool = pool.concat(Object.values(WEAPONS).map((w: any) => ({...w, pickupType:'weapon'})));
        } else {
            pool = pool.concat(Object.values(WEAPONS).filter((w: any) => ownedWeaponIds.includes(w.id)).map((w: any) => ({...w, pickupType:'weapon'})));
        }
        
        const ownedPassiveIds = passiveInventory.map(p => p.id);
        if (passiveInventory.length < MAX_SLOTS) {
            pool = pool.concat(PASSIVES.map(p => ({...p, pickupType:'passive'})));
        } else {
            pool = pool.concat(PASSIVES.filter(p => ownedPassiveIds.includes(p.id)).map(p => ({...p, pickupType:'passive'})));
        }
        
        if (pool.length === 0) pool.push({ nameKey: 'maxHeal', icon: '💖', type: 'heal', descKey: 'healAll' });
        
        levelUpChoices = [];
        for(let i=0; i<3; i++) {
            const rand = pool[Math.floor(Math.random() * pool.length)];
            levelUpChoices.push(rand);
        }
        
        renderLevelUpCards();
        document.getElementById('levelup-screen')?.classList.remove('hidden');
        const wikiBtn = document.getElementById('wiki-btn-levelup');
        if(wikiBtn) wikiBtn.onclick = openEncyclopedia;
    }

    function renderLevelUpCards() {
        const container = document.getElementById('cards-container');
        if(!container) return;
        container.innerHTML = '';
        
        // 获取当前语言
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        
        levelUpChoices.forEach((choice, index) => {
            const el = document.createElement('div');
            el.className = `card ${index === selectedRewardIndex ? 'selected' : ''}`;
            
            let status = "";
            let upgradeInfo = "";
            // 获取翻译后的名称和描述
            const choiceName = choice.nameKey ? getText(choice.nameKey) : (choice.name || getText('maxHeal'));
            const choiceDesc = choice.descKey ? getText(choice.descKey) : (choice.desc || getText('healAll'));
            const choiceUpg = choice.upgKey ? getText(choice.upgKey) : (choice.upg || '');
            
            if (choice.pickupType === 'weapon') {
                 const owned = weaponInventory.find(w => w.id === choice.id);
                 status = owned ? `${getText('upgrade')} (Lv.${owned.stack+1})` : getText('newWeapon');
                 upgradeInfo = choiceUpg; 
            } else if (choice.pickupType === 'passive') {
                 const owned = passiveInventory.find(p => p.id === choice.id);
                 status = owned ? `${getText('upgrade')} (Lv.${owned.stack+1})` : getText('newAbility');
                 upgradeInfo = choiceUpg; 
            } else if (choice.type === 'heal') {
                 status = getText('instantHeal'); upgradeInfo = getText('healAll');
            }
            
            // 英文版使用更小的字体和更紧凑的布局
            const titleSize = isEn ? '18px' : '24px';
            const descSize = isEn ? '13px' : '16px';
            const upgSize = isEn ? '13px' : '16px';
            const statusSize = isEn ? '11px' : '14px';
            
            el.innerHTML = `
                <div class="card-icon" style="font-size:160px; margin-bottom:15px; width:160px; height:160px; display:flex; justify-content:center; align-items:center;">${renderIcon(choice, 160)}</div>
                <div class="card-title" style="margin-bottom:10px; font-size:${titleSize}; letter-spacing:${isEn ? '0.05em' : '0.15em'};">${choiceName}</div>
                <div class="card-desc" style="font-size:${descSize}; color:#aaa; margin-bottom:15px; letter-spacing:${isEn ? '0.02em' : '0.1em'}; line-height:1.4;">${choiceDesc.replace(/。/g, "。<br>").replace(/：/g, ": ")}</div>
                <div class="card-upg" style="color:#0f0; font-size:${upgSize}; letter-spacing:${isEn ? '0.02em' : '0.1em'};">${upgradeInfo}</div>
                <div class="card-desc" style="color:#666; font-size:${statusSize}; margin-top:8px; letter-spacing:${isEn ? '0.02em' : '0.1em'};">${status}</div>
            `;
            el.onclick = () => {
                selectedRewardIndex = index;
                renderLevelUpCards();
                selectLevelUpReward(choice);
            };
            container.appendChild(el);
        });
    }

    function selectLevelUpReward(choice: any) {
        document.getElementById('levelup-screen')?.classList.add('hidden');
        SoundSystem.play('uiConfirm');
        if (choice.type === 'heal') {
            currentHp = maxHp;
        } else {
            tryPickup({ type: choice.pickupType, data: choice });
        }
        isPaused = false;
        uiState = 'playing';
        // 不需要再调用 loop()，因为 loop 已经在运行（只是暂停状态）
    }

    function updateHud() {
        const hpPercent = (currentHp / maxHp) * 100;
        const displayXp = Math.floor(xp);
        const xpPercent = (displayXp / xpToNextLevel) * 100;
        const dynamicHpWidth = 100 + Math.max(0, (maxHp - 100) * 0.5);
        const dynamicXpWidth = 100 + (level * 5);

        const hpCont = document.getElementById('hp-container');
        if(hpCont) hpCont.style.width = `${dynamicHpWidth}px`;
        const xpCont = document.getElementById('xp-container');
        if(xpCont) xpCont.style.width = `${dynamicXpWidth}px`;

        const hpBar = document.getElementById('hp-bar');
        if(hpBar) hpBar.style.width = `${Math.max(0, hpPercent)}%`;
        const xpBar = document.getElementById('xp-bar');
        if(xpBar) xpBar.style.width = `${Math.min(100, xpPercent)}%`;
        const scoreEl = document.getElementById('score-display');
        if(scoreEl) scoreEl.innerText = score.toString();
        const levelEl = document.getElementById('level-display');
        if(levelEl) levelEl.innerText = level.toString();

        const hpText = document.getElementById('hp-text');
        if (hpText) hpText.innerText = `${Math.floor(currentHp)}/${Math.floor(maxHp)}`;
        const xpText = document.getElementById('xp-text');
        if (xpText) xpText.innerText = `${displayXp}/${Math.floor(xpToNextLevel)}`;
    }

    function gameVictory() {
        isPaused = true;
        uiState = 'gameover';
        // 停止游戏循环
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        SoundSystem.play('levelup');
        
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        
        const goTitle = document.getElementById('go-title');
        if(goTitle) { goTitle.innerText = getText('victory'); goTitle.style.color = "#d4af37"; }
        const finalFloor = document.getElementById('final-floor');
        if(finalFloor) finalFloor.innerText = getText('allClear');
        const finalScore = document.getElementById('final-score');
        if(finalScore) finalScore.innerText = score.toString();
        
        // 更新游戏结束界面的文本
        updateGameOverUI(true);
        
        document.getElementById('gameover-screen')?.classList.remove('hidden');
        document.getElementById('pause-btn')?.classList.add('hidden');
        
        const restartBtn = document.getElementById('btn-restart-gameover');
        if(restartBtn) {
            restartBtn.onclick = () => {
                // 隐藏道具栏
                const invPanel = document.getElementById('inventory-panel');
                if(invPanel) invPanel.style.display = 'none';
                goToCharSelect();
            };
            restartBtn.textContent = getText('awakenAgain');
            restartBtn.style.fontSize = isEn ? '14px' : '16px';
        }
        
        // 通关简单或普通模式解锁所有角色
        let newUnlocks = false;
        DRAGONS.forEach(type => {
            if (!unlockedDragons[type]) {
                unlockedDragons[type] = true;
                newUnlocks = true;
            }
        });
        if (newUnlocks) {
            localStorage.setItem('dragon_unlocks', JSON.stringify(unlockedDragons));
            showToast(getText('allUnlocked'), "🐉", true);
        }
    }

    function gameOver() {
        isPaused = true;
        uiState = 'gameover';
        // 停止游戏循环
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        SoundSystem.play('gameover');
        
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        
        const goTitle = document.getElementById('go-title');
        if(goTitle) { goTitle.innerText = getText('youDied'); goTitle.style.color = "#666"; }
        const finalFloor = document.getElementById('final-floor');
        if(finalFloor) finalFloor.innerText = `${floor}-${MAX_FLOORS}`;
        const finalScore = document.getElementById('final-score');
        if(finalScore) finalScore.innerText = score.toString();
        
        // 更新游戏结束界面的文本
        updateGameOverUI(false);
        
        document.getElementById('gameover-screen')?.classList.remove('hidden');
        document.getElementById('pause-btn')?.classList.add('hidden');
        
        const restartBtn = document.getElementById('btn-restart-gameover');
        if(restartBtn) {
            restartBtn.onclick = () => {
                // 隐藏道具栏
                const invPanel = document.getElementById('inventory-panel');
                if(invPanel) invPanel.style.display = 'none';
                goToCharSelect();
            };
            restartBtn.textContent = getText('awakenAgain');
            restartBtn.style.fontSize = isEn ? '14px' : '16px';
        }
    }
    
    function updateGameOverUI(isVictory: boolean) {
        const lang = (window as any).gameLanguage || 'zh';
        const isEn = lang === 'en';
        
        // 更新描述文本
        const descEl = document.querySelector('#gameover-screen p:first-of-type');
        if (descEl) {
            descEl.textContent = isVictory ? getText('conquered') : getText('journeyEnds');
            (descEl as HTMLElement).style.fontSize = isEn ? '14px' : '16px';
        }
        
        // 更新层数标签
        const floorLabelEl = document.querySelector('#gameover-screen p:nth-of-type(2)');
        if (floorLabelEl) {
            const floorSpan = floorLabelEl.querySelector('span');
            const floorValue = floorSpan ? floorSpan.outerHTML : '';
            floorLabelEl.innerHTML = `${getText('floorReached')}: ${floorValue}`;
            (floorLabelEl as HTMLElement).style.fontSize = isEn ? '14px' : '16px';
        }
        
        // 更新得分标签
        const scoreLabelEl = document.querySelector('#gameover-screen p:nth-of-type(3)');
        if (scoreLabelEl) {
            const scoreSpan = scoreLabelEl.querySelector('span');
            const scoreValue = scoreSpan ? scoreSpan.outerHTML : '';
            scoreLabelEl.innerHTML = `${getText('finalScore')}: ${scoreValue}`;
            (scoreLabelEl as HTMLElement).style.fontSize = isEn ? '14px' : '16px';
        }
    }

    // ✅ 优化：提取渲染辅助函数到draw内部或外部，避免重复创建闭包
    function draw() {
        if (!ctx) return;
        const [crX, crY] = currentRoomKey.split(',').map(Number);
        const offsetX = crX * ROOM_WIDTH;
        const offsetY = crY * ROOM_HEIGHT;
        
        // ✅ 优化：使用位运算加速取整
        const toScreenX = (gx: number) => ((gx - offsetX) * gridSize) | 0;
        const toScreenY = (gy: number) => ((gy - offsetY) * gridSize) | 0;
        
        const isVisible = (gx: number, gy: number) => 
            gx >= offsetX && gx < offsetX + ROOM_WIDTH && gy >= offsetY && gy < offsetY + ROOM_HEIGHT;
        
        if (getPassiveStack('aim') > 0) canvas!.style.cursor = 'none';
        else canvas!.style.cursor = 'default';
        
        // Clear logic
        ctx.fillStyle = C_BG; ctx.fillRect(0, 0, canvas!.width, canvas!.height); 
        ctx.fillStyle = C_HUD_BG; ctx.fillRect(0, 0, canvas!.width, MAP_OFFSET_Y);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, MAP_OFFSET_Y, canvas!.width, canvas!.height - MAP_OFFSET_Y);
        ctx.clip();
        ctx.translate(0, MAP_OFFSET_Y); 
        
        // Draw floor tiles with dimian.png
        const floorImg = loadImage('/dimian.png');
        if (floorImg) {
            for(let x=0; x<canvas!.width; x+=gridSize) {
                for(let y=0; y<canvas!.height - MAP_OFFSET_Y; y+=gridSize) {
                    ctx.drawImage(floorImg, x, y, gridSize, gridSize);
                }
            }
        } else {
            ctx.fillStyle = C_BG; ctx.fillRect(0, 0, canvas!.width, canvas!.height - MAP_OFFSET_Y);
            ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.beginPath();
            for(let x=0; x<=canvas!.width; x+=gridSize) { ctx.moveTo(x,0); ctx.lineTo(x,canvas!.height); }
            for(let y=0; y<=canvas!.height; y+=gridSize) { ctx.moveTo(0,y); ctx.lineTo(canvas!.width,y); }
            ctx.stroke();
        }
    
        const room = rooms[currentRoomKey];
        if (room) {
             const midX = Math.floor(ROOM_WIDTH / 2);
             const midY = Math.floor(ROOM_HEIGHT / 2);
             
             for(let i=0; i<room.connected.length; i++) {
                 const d = room.connected[i];
                 const nKey = `${room.gx + d.x},${room.gy + d.y}`;
                 const neighbor = rooms[nKey];
                 if (neighbor && neighbor.isBossRoom) {
                     let rx = 0, ry = 0, rw = 0, rh = 0;
                     if (d.x === 1) { rx=(ROOM_WIDTH-2)*gridSize; ry=(midY-2)*gridSize; rw=2*gridSize; rh=4*gridSize; }
                     else if (d.x === -1) { rx=0; ry=(midY-2)*gridSize; rw=2*gridSize; rh=4*gridSize; }
                     else if (d.y === 1) { rx=(midX-2)*gridSize; ry=(ROOM_HEIGHT-2)*gridSize; rw=4*gridSize; rh=2*gridSize; }
                     else if (d.y === -1) { rx=(midX-2)*gridSize; ry=0; rw=4*gridSize; rh=2*gridSize; }

                     ctx.save();
                     ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
                     
                     const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.1);
                     ctx.fillStyle = `rgba(100, 30, 30, ${0.4 + pulse * 0.4})`;
                     ctx.fillRect(rx, ry, rw, rh);
                     
                     ctx.fillStyle = '#944'; 
                     const cx = rx + rw/2; const cy = ry + rh/2;
                     ctx.fillRect(cx - 6, cy - 6, 12, 10); 
                     ctx.fillRect(cx - 4, cy + 4, 2, 4); 
                     ctx.fillRect(cx + 2, cy + 4, 2, 4); 
                     ctx.fillStyle = '#422'; 
                     ctx.fillRect(cx - 4, cy - 2, 3, 3);
                     ctx.fillRect(cx + 1, cy - 2, 3, 3);
                     ctx.strokeStyle = `rgba(180, 50, 50, ${pulse})`;
                     ctx.lineWidth = 2; ctx.strokeRect(rx, ry, rw, rh);
                     ctx.restore();
                 }
             }
        }
    
        worldObjects.walls.forEach((key: number) => {
            const {x: wx, y: wy} = unpackKey(key);
            if (isVisible(wx, wy)) {
                const px = toScreenX(wx);
                const py = toScreenY(wy);
                const wallImg = loadImage('/zhuankuai.png');
                if (wallImg) {
                    ctx.drawImage(wallImg, px, py, gridSize, gridSize);
                } else {
                    ctx.fillStyle = '#4a4a50'; ctx.fillRect(px, py, gridSize, gridSize); 
                    ctx.fillStyle = '#666'; ctx.fillRect(px, py, gridSize - 1, gridSize - 4); 
                    ctx.fillStyle = '#222'; ctx.fillRect(px, py + gridSize - 4, gridSize - 1, 4); 
                    ctx.fillStyle = '#000'; ctx.fillRect(px + gridSize - 1, py, 1, gridSize); 
                }
            }
        });
    
        if (exitPortal && isVisible(exitPortal.x, exitPortal.y)) {
             const px = toScreenX(exitPortal.x);
             const py = toScreenY(exitPortal.y);
             const cx = px + gridSize/2;
             const cy = py + gridSize/2;
             
             ctx.save();
             ctx.translate(cx, cy);
             const rot = frameCount * 0.05;
             ctx.rotate(rot);
             
             ctx.fillStyle = '#000'; 
             ctx.beginPath(); ctx.arc(0, 0, gridSize * 0.5, 0, Math.PI*2); ctx.fill();
             ctx.strokeStyle = '#d000ff';
             ctx.lineWidth = 2; ctx.stroke();

             for(let i=0; i<4; i++) {
                 ctx.rotate(Math.PI/2);
                 for(let j=0; j<5; j++) {
                     ctx.fillStyle = j%2===0 ? '#d000ff' : '#4a00e0';
                     const offset = j * 4;
                     const size = 6 - j;
                     ctx.fillRect(offset + 6, offset * 0.5, size, size);
                 }
             }
             ctx.fillStyle = '#fff';
             for(let i=0; i<8; i++) {
                 const angle = (i / 8) * Math.PI * 2 + rot * -2;
                 const dist = gridSize * (0.8 + 0.4 * Math.sin(frameCount*0.1 + i));
                 ctx.fillRect(Math.cos(angle)*dist, Math.sin(angle)*dist, 2, 2);
             }
             ctx.restore();
        }
    
        for(let i=0; i<worldObjects.crates.length; i++) {
            const c = worldObjects.crates[i];
            if (isVisible(c.x, c.y)) {
                const px = toScreenX(c.x);
                const py = toScreenY(c.y);
                const crateImg = loadImage('/muxiang.png');
                if (crateImg) {
                    ctx.drawImage(crateImg, px, py, gridSize, gridSize);
                } else {
                    ctx.fillStyle = C_CRATE; ctx.fillRect(px+1, py+1, gridSize-2, gridSize-2);
                    ctx.strokeStyle = '#5c3a1e'; ctx.lineWidth = 2; ctx.strokeRect(px+1, py+1, gridSize-2, gridSize-2);
                    ctx.beginPath(); ctx.moveTo(px+1, py+1); ctx.lineTo(px+gridSize-2, py+gridSize-2); ctx.stroke();
                }
            }
        }
    
        for(let i=0; i<worldObjects.pickups.length; i++) {
            const p = worldObjects.pickups[i];
            if (isVisible(p.x, p.y)) {
                const px = toScreenX(p.x);
                const py = toScreenY(p.y);
                // All pickups now render as treasure chest with glow effect
                const chestImg = loadImage('/baoxiang.png');
                // 动态发光效果 - 暗金色
                const glowIntensity = 0.5 + 0.5 * Math.sin(frameCount * 0.1);
                ctx.save();
                ctx.shadowColor = '#886622';
                ctx.shadowBlur = 8 + glowIntensity * 8;
                if (chestImg) {
                    ctx.drawImage(chestImg, px, py, gridSize, gridSize);
                } else {
                    // Fallback to colored circle
                    ctx.fillStyle = '#d4af37';
                    ctx.beginPath(); ctx.arc(px + gridSize/2, py + gridSize/2, 8, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#fff'; ctx.font = '12px serif'; ctx.fillText('📦', px+2, py+14);
                }
                ctx.restore();
            }
        }
    
        for(let i=0; i<worldObjects.items.length; i++) {
            const item = worldObjects.items[i];
            if (isVisible(item.x, item.y)) {
                const px = toScreenX(item.x);
                const py = toScreenY(item.y);
                if (item.type === 'sheep') {
                    ctx.fillStyle = C_FOOD_SHEEP;
                    const cx = px + gridSize/2; const cy = py + gridSize/2;
                    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 6, cy - 4, 12, 10);
                    ctx.fillStyle = '#eee'; ctx.fillRect(cx - 8, cy - 2, 2, 6); ctx.fillRect(cx + 6, cy - 2, 2, 6); ctx.fillRect(cx - 4, cy - 6, 8, 2);
                    ctx.fillStyle = '#222'; ctx.fillRect(cx + 4, cy - 3, 5, 5);
                    ctx.fillStyle = '#fff'; ctx.fillRect(cx + 6, cy - 2, 1, 1);
                    ctx.fillStyle = '#111'; ctx.fillRect(cx - 4, cy + 6, 2, 3); ctx.fillRect(cx + 2, cy + 6, 2, 3);
                } else if (item.type === 'wildfire') {
                    const xpImg = loadImage('/jingyan.png');
                    // 动态发光效果 - 暗青色
                    const glowIntensity = 0.5 + 0.5 * Math.sin(frameCount * 0.15 + item.x + item.y);
                    ctx.save();
                    ctx.shadowColor = '#226688';
                    ctx.shadowBlur = 8 + glowIntensity * 8;
                    if (xpImg) {
                        ctx.drawImage(xpImg, px, py, gridSize, gridSize);
                    } else {
                        // Fallback to diamond if image not loaded
                        ctx.fillStyle = C_FOOD_WILDFIRE; 
                        const cx = px + gridSize/2; const cy = py + gridSize/2;
                        const sz = gridSize/2 - 2;
                        ctx.beginPath();
                        ctx.moveTo(cx, cy - sz); ctx.lineTo(cx + sz, cy); ctx.lineTo(cx, cy + sz); ctx.lineTo(cx - sz, cy); 
                        ctx.fill();
                        ctx.fillStyle = '#fff'; 
                        ctx.beginPath();
                        ctx.moveTo(cx, cy - 2); ctx.lineTo(cx + 2, cy); ctx.lineTo(cx, cy + 2); ctx.lineTo(cx - 2, cy); 
                        ctx.fill();
                    }
                    ctx.restore();
                } else if (item.type === 'walker') {
                    // Use image for enemies based on floor
                    const enemyImgSrc = floor === 1 ? '/ren.png' : floor === 2 ? '/shou.png' : '/long.png';
                    const enemyImg = loadImage(enemyImgSrc);
                    const w = (item.w || 1) * gridSize;
                    const h = (item.h || 1) * gridSize;
                    
                    if (enemyImg) {
                        // Apply color overlay for frozen/poisoned
                        if (item.frozen > 0 || item.poisoned > 0) {
                            ctx.globalAlpha = 0.5;
                            ctx.fillStyle = item.frozen > 0 ? C_FROZEN_OVERLAY : '#00ff00';
                            ctx.fillRect(px, py, w, h);
                            ctx.globalAlpha = 1.0;
                        }
                        ctx.drawImage(enemyImg, px, py, w, h);
                        if (item.frozen > 0 || item.poisoned > 0) {
                            ctx.globalAlpha = 0.4;
                            ctx.fillStyle = item.frozen > 0 ? C_FROZEN_OVERLAY : '#00ff00';
                            ctx.fillRect(px, py, w, h);
                            ctx.globalAlpha = 1.0;
                        }
                    } else {
                        // Fallback to original drawing if image not loaded
                        ctx.fillStyle = C_ENEMY_WALKER;
                        if (item.frozen > 0) ctx.fillStyle = C_FROZEN_OVERLAY; 
                        if (item.poisoned > 0) ctx.fillStyle = '#00ff00'; 
                        ctx.fillRect(px + 2, py + 2, w - 4, h - 4);
                    }
                }
            }
        }
    
        for(let i=0; i<worldObjects.bullets.length; i++) {
            const b = worldObjects.bullets[i];
            if (isVisible(b.x, b.y)) {
                const px = toScreenX(b.x);
                const py = toScreenY(b.y);
                const cx = px + gridSize/2; const cy = py + gridSize/2;

                ctx.fillStyle = b.color || C_BULLET;

                if (b.weaponType === 'classic' || b.weaponType === 'triple') {
                    ctx.fillStyle = '#fa0';
                    ctx.fillRect(cx - 3, cy - 3, 6, 6);
                    ctx.fillStyle = '#f50';
                    ctx.fillRect(cx - 4, cy - 1, 1, 3); ctx.fillRect(cx + 3, cy - 1, 1, 3);
                    ctx.fillRect(cx - 1, cy - 4, 3, 1); ctx.fillRect(cx - 1, cy + 3, 3, 1);
                } else if (b.weaponType === 'heavy') {
                    ctx.fillStyle = '#000';
                    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI*2); ctx.fill();
                } else if (b.weaponType === 'rapid') {
                    ctx.fillStyle = '#ff0';
                    ctx.beginPath();
                    ctx.moveTo(cx, cy-5); ctx.lineTo(cx+3, cy); ctx.lineTo(cx-3, cy); ctx.lineTo(cx, cy+5);
                    ctx.fill();
                } else if (b.weaponType === 'snowball') {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#adf';
                    ctx.fillRect(cx-1, cy-4, 2, 8); ctx.fillRect(cx-4, cy-1, 8, 2);
                } else if (b.weaponType === 'venom') {
                     ctx.fillStyle = '#0f0';
                     ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
                     ctx.fillStyle = '#050';
                     ctx.fillRect(cx-2, cy-2, 2, 2); ctx.fillRect(cx+1, cy+1, 1, 1);
                } else if (b.weaponType === 'plasma') {
                     ctx.fillStyle = '#0ff';
                     ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill();
                     ctx.shadowColor = '#0ff'; ctx.shadowBlur = 5; ctx.stroke(); ctx.shadowBlur = 0;
                } else {
                     const size = 6;
                     ctx.fillRect(px + gridSize/2 - size/2, py + gridSize/2 - size/2, size, size);
                }
            }
        }

        if (worldObjects.lightning) {
             for(let i=worldObjects.lightning.length-1; i>=0; i--) {
                 const l = worldObjects.lightning[i];
                 l.life--;
                 if (isVisible(l.x1, l.y1) || isVisible(l.x2, l.y2)) {
                     const p1x = toScreenX(l.x1); const p1y = toScreenY(l.y1);
                     const p2x = toScreenX(l.x2); const p2y = toScreenY(l.y2);
                     
                     ctx.strokeStyle = l.color; ctx.lineWidth = 2;
                     ctx.shadowColor = l.color; ctx.shadowBlur = 10;
                     ctx.beginPath();
                     ctx.moveTo(p1x + gridSize/2, p1y + gridSize/2);
                     const midX = (p1x + p2x) / 2; const midY = (p1y + p2y) / 2;
                     const jitter = 10;
                     ctx.lineTo(midX + (Math.random()-0.5)*jitter, midY + (Math.random()-0.5)*jitter);
                     ctx.lineTo(p2x + gridSize/2, p2y + gridSize/2);
                     ctx.stroke(); ctx.shadowBlur = 0;
                 }
                 if(l.life <= 0) worldObjects.lightning.splice(i, 1);
             }
        }
    
        for(let i=0; i<worldObjects.explosions.length; i++) {
            const e = worldObjects.explosions[i];
            if (isVisible(e.x, e.y)) {
                const px = toScreenX(e.x); const py = toScreenY(e.y);
                const progress = 1 - (e.life / e.maxLife);
                ctx.fillStyle = '#ff4400';
                ctx.globalAlpha = 0.6 * (e.life / e.maxLife);
                ctx.beginPath();
                ctx.arc(px + gridSize/2, py + gridSize/2, gridSize * e.radius * (0.5 + progress*0.5), 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    
        if (boss && boss.active && isVisible(boss.x, boss.y)) {
            const px = toScreenX(boss.x);
            const py = toScreenY(boss.y);
            ctx.fillStyle = boss.color; 
            if (boss.dashState === 'prepare') ctx.fillStyle = '#ff0000'; 
            if (boss.frozen > 0) ctx.fillStyle = C_FROZEN_OVERLAY;
            if (boss.poisoned > 0) ctx.fillStyle = '#00ff00';
            
            const bw = boss.w * gridSize;
            const bh = boss.h * gridSize;

            // Use boss images based on floor
            const bossImgSrc = floor === 1 ? '/renboss.png' : floor === 2 ? '/shouboss.png' : '/longbpss.png';
            const bossImg = loadImage(bossImgSrc);
            
            if (bossImg) {
                // Draw dash trail for floor 3 boss
                if (floor === 3 && boss.dashTrail && boss.dashTrail.length > 0) {
                    for(let tIdx=0; tIdx<boss.dashTrail.length; tIdx++) {
                        const t = boss.dashTrail[tIdx];
                        const tpx = toScreenX(t.x); const tpy = toScreenY(t.y);
                        ctx.globalAlpha = t.life/20;
                        ctx.drawImage(bossImg, tpx, tpy, bw, bh);
                        t.life--;
                    }
                    ctx.globalAlpha = 1.0;
                }
                
                // Apply color overlay for frozen/poisoned/dash prepare
                if (boss.dashState === 'prepare') {
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(px, py, bw, bh);
                    ctx.globalAlpha = 1.0;
                }
                
                ctx.drawImage(bossImg, px, py, bw, bh);
                
                if (boss.frozen > 0 || boss.poisoned > 0) {
                    ctx.globalAlpha = 0.4;
                    ctx.fillStyle = boss.frozen > 0 ? C_FROZEN_OVERLAY : '#00ff00';
                    ctx.fillRect(px, py, bw, bh);
                    ctx.globalAlpha = 1.0;
                }
            } else {
                // Fallback to original drawing if image not loaded
                if (floor === 3) {
                     ctx.fillStyle = '#000'; ctx.lineWidth = 2;
                     ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(frameCount * 0.2) * 0.5})`;
                     ctx.beginPath();
                     ctx.moveTo(px + bw/2, py); ctx.lineTo(px + bw, py + bh); ctx.lineTo(px, py + bh);
                     ctx.fill(); ctx.stroke();
                } else {
                     ctx.fillRect(px, py, bw, bh);
                }
            }
        }
    
        // Draw Snakes
        snakes.forEach((snake, sIdx) => {
            const bodyImgSrc = dragonStats[snake.type]?.bodyImg;
            const bodyImg = bodyImgSrc ? loadImage(bodyImgSrc) : null;
            
            snake.body.forEach((part, index) => {
                if (invincibleTimer > 0 && Math.floor(frameCount / 4) % 2 === 0) return;
                if (isVisible(part.x, part.y)) {
                    const px = toScreenX(part.x); const py = toScreenY(part.y);
                    if (index === 0) {
                        // Head - use body image or fallback to color
                        if (bodyImg) {
                            if (getPassiveTotal('devour') > 0 && devourTimer <= 0) {
                                ctx.shadowBlur = 10; ctx.shadowColor = '#ff00ff';
                            }
                            ctx.drawImage(bodyImg, px, py, gridSize, gridSize);
                            ctx.shadowBlur = 0;
                            // Eyes
                            ctx.fillStyle = '#ffaa00'; ctx.fillRect(px + 4, py + 4, 4, 4);
                        } else {
                            ctx.fillStyle = snake.color;
                            if (getPassiveTotal('devour') > 0 && devourTimer <= 0) {
                                ctx.shadowBlur = 10; ctx.shadowColor = '#ff00ff';
                            }
                            ctx.fillRect(px, py, gridSize, gridSize);
                            ctx.shadowBlur = 0; 
                            ctx.fillStyle = '#ffaa00'; ctx.fillRect(px + 4, py + 4, 4, 4);
                        }
                        
                        // Add P1/P2 indicator above head
                        if (numPlayers === 2) {
                            ctx.fillStyle = '#fff';
                            ctx.font = '8px "Press Start 2P"';
                            ctx.fillText(`P${snake.id}`, px + 4, py - 4);
                        }

                        ctx.fillStyle = '#000';
                        let dx = 0, dy = 0;
                        if (snake.velocity.x !== 0 || snake.velocity.y !== 0) { dx = snake.velocity.x; dy = snake.velocity.y; } 
                        else { dx = snake.lastDir.x; dy = snake.lastDir.y; }

                        if (dx === 1) ctx.fillRect(px + gridSize - 4, py + 4, 4, 12); 
                        else if (dx === -1) ctx.fillRect(px, py + 4, 4, 12); 
                        else if (dy === 1) ctx.fillRect(px + 4, py + gridSize - 4, 12, 4); 
                        else if (dy === -1) ctx.fillRect(px + 4, py, 12, 4); 

                    } else {
                        // Body - use body image or fallback to color
                        if (bodyImg) {
                            ctx.globalAlpha = 0.6 + (0.4 * (1 - index/snake.body.length));
                            if (hasSideCannon()) {
                                ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(px+2, py+2, gridSize-4, gridSize-4);
                            }
                            ctx.drawImage(bodyImg, px + 1, py + 1, gridSize - 2, gridSize - 2);
                            ctx.globalAlpha = 1.0;
                        } else {
                            ctx.fillStyle = snake.color;
                            ctx.globalAlpha = 0.6 + (0.4 * (1 - index/snake.body.length));
                            
                            if (hasSideCannon() && invincibleTimer > 0) {
                                ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.strokeRect(px, py, gridSize, gridSize);
                            } else if (hasSideCannon()) {
                                ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(px+2, py+2, gridSize-4, gridSize-4);
                            }
            
                            ctx.fillRect(px + 1, py + 1, gridSize - 2, gridSize - 2);
                            ctx.globalAlpha = 1.0;
                        }
                    }
                }
            });
        });
        
        drawParticles(offsetX, offsetY);
        ctx.restore();
        
        // Aim Reticle (P1 Only)
        if (getPassiveStack('aim') > 0 && mouseRef.current) {
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            if (my > MAP_OFFSET_Y) {
                ctx.save();
                ctx.translate(mx, my);
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -12); ctx.lineTo(0, -4); ctx.moveTo(0, 4); ctx.lineTo(0, 12);
                ctx.moveTo(-12, 0); ctx.lineTo(-4, 0); ctx.moveTo(4, 0); ctx.lineTo(12, 0);
                ctx.stroke();
                ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
                ctx.restore();
            }
        }
        
        drawMinimap(crX, crY);
    }

    function drawMinimap(currentRx: number, currentRy: number) {
        if (!ctx) return;
        const mapSize = 80; 
        const mapX = canvas!.width - mapSize - 10; 
        const mapY = 5; 
        const roomSize = 8;
        
        ctx.fillStyle = '#111'; ctx.fillRect(mapX, mapY, mapSize, mapSize);
        ctx.strokeStyle = '#444'; ctx.strokeRect(mapX, mapY, mapSize, mapSize);
        
        const centerX = mapX + mapSize/2; const centerY = mapY + mapSize/2;
        
        Object.values(rooms).forEach((r: any) => {
            const dx = (r.gx - currentRx) * (roomSize + 2);
            const dy = (r.gy - currentRy) * (roomSize + 2);
            
            ctx.fillStyle = '#222'; 
            if (r.explored) ctx.fillStyle = '#444'; 
            if (r.gx === currentRx && r.gy === currentRy) ctx.fillStyle = C_UI_GOLD; 
            
            if (Math.abs(dx) < mapSize/2 - 5 && Math.abs(dy) < mapSize/2 - 5) {
                ctx.fillRect(centerX + dx - roomSize/2, centerY + dy - roomSize/2, roomSize, roomSize);
                
                if (r.isBossRoom) {
                        const rx = centerX + dx - roomSize/2;
                        const ry = centerY + dy - roomSize/2;
                        ctx.fillStyle = '#f00';
                        ctx.fillRect(rx + 2, ry + 2, 4, 3); 
                        ctx.fillRect(rx + 2, ry + 5, 1, 2); 
                        ctx.fillRect(rx + 5, ry + 5, 1, 2); 
                }

                if (r.explored || (r.gx === currentRx && r.gy === currentRy)) {
                    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
                    r.connected.forEach((d: any) => {
                        ctx.beginPath(); ctx.moveTo(centerX + dx, centerY + dy);
                        ctx.lineTo(centerX + dx + d.x * (roomSize+2), centerY + dy + d.y * (roomSize+2)); ctx.stroke();
                    });
                }
            }
        });
    }

    function drawParticles(offsetX: number, offsetY: number) {
        for (let i = worldObjects.particles.length - 1; i >= 0; i--) {
            let p = worldObjects.particles[i];
            p.x += p.vx; p.y += p.vy; p.life--;
            const sx = ((p.x * gridSize) - (offsetX * gridSize)) | 0;
            const sy = ((p.y * gridSize) - (offsetY * gridSize)) | 0;
            
            if (sx > 0 && sx < canvas!.width && sy > -gridSize && sy < canvas!.height - MAP_OFFSET_Y) {
                ctx!.fillStyle = p.color; ctx!.globalAlpha = p.life / 30;
                
                if (p.type === 'star') {
                    const cx = sx + gridSize/2; const cy = sy + gridSize/2;
                    const r = 8 * (p.life / 20);
                    ctx!.beginPath();
                    for(let k=0; k<4; k++) {
                        const angle = (k * Math.PI/2);
                        ctx!.lineTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
                        ctx!.lineTo(cx + Math.cos(angle+Math.PI/4)*(r/3), cy + Math.sin(angle+Math.PI/4)*(r/3));
                    }
                    ctx!.closePath(); ctx!.fill();
                } else if (p.type === 'crit_cross') {
                    const cx = sx + gridSize/2; const cy = sy + gridSize/2;
                    ctx!.fillStyle = '#ff0000'; ctx!.globalAlpha = p.life / 15;
                    ctx!.save(); ctx!.translate(cx, cy);
                    ctx!.beginPath();
                    for(let k=0; k<8; k++) {
                         const r = k%2===0 ? 12 : 3;
                         const angle = k * Math.PI/4;
                         ctx!.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    }
                    ctx!.closePath(); ctx!.fill();
                    ctx!.restore();
                }
                else if (p.isText) { ctx!.font = '10px "Press Start 2P"'; ctx!.fillText(p.text, sx, sy); }
                else { ctx!.fillRect(sx + gridSize/2, sy + gridSize/2, 4, 4); }
                ctx!.globalAlpha = 1.0;
            }
            if (p.life <= 0) worldObjects.particles.splice(i, 1);
        }
    }

    function createParticles(gx: number, gy: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            worldObjects.particles.push({
                x: gx, y: gy,
                vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                life: 20 + Math.random() * 10, color: color
            });
        }
    }

    // Input Handlers
    // Helper to check direction keys (Arrow keys or WASD)
    const isUp = (key: string) => key === 'ArrowUp' || key === 'w' || key === 'W';
    const isDown = (key: string) => key === 'ArrowDown' || key === 's' || key === 'S';
    const isLeft = (key: string) => key === 'ArrowLeft' || key === 'a' || key === 'A';
    const isRight = (key: string) => key === 'ArrowRight' || key === 'd' || key === 'D';

    const handleKeydown = (e: KeyboardEvent) => {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", "Space"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    
        if (uiState === 'start') {
            if (e.key === 'Enter') goToCharSelect();
            return;
        }
    
        if (uiState === 'char_select') {
            // charSelectRow: 0=角色卡片(4x2), 1=难度/模式, 2=进入地牢, 3=测试
            // optionCol: 0=难度, 1=模式 (仅在charSelectRow===1时使用)
            if (isUp(e.key)) {
                if (charSelectRow === 0) {
                    // 在角色卡片区域，上移一行（从下排到上排）
                    if (dragonMenuIndex >= 4) {
                        dragonMenuIndex -= 4;
                        setChar(DRAGONS[dragonMenuIndex]);
                    }
                } else if (charSelectRow > 0) {
                    charSelectRow--;
                    if (charSelectRow === 0) {
                        // 回到角色卡片区域，保持在下排
                        dragonMenuIndex = Math.min(dragonMenuIndex, 3) + 4;
                        if (dragonMenuIndex >= DRAGONS.length) dragonMenuIndex = DRAGONS.length - 1;
                    }
                }
                refreshCharCards(); SoundSystem.play('uiSelect');
            } else if (isDown(e.key)) {
                if (charSelectRow === 0) {
                    // 在角色卡片区域
                    if (dragonMenuIndex < 4) {
                        // 上排，下移到下排
                        dragonMenuIndex += 4;
                        if (dragonMenuIndex >= DRAGONS.length) dragonMenuIndex = DRAGONS.length - 1;
                        setChar(DRAGONS[dragonMenuIndex]);
                    } else {
                        // 下排，下移到难度/模式
                        charSelectRow = 1;
                    }
                } else if (charSelectRow < 4) {
                    charSelectRow++;
                }
                refreshCharCards(); SoundSystem.play('uiSelect');
            } else if (isLeft(e.key)) {
                if (charSelectRow === 0) {
                    // 角色卡片区域左移
                    const row = Math.floor(dragonMenuIndex / 4);
                    const col = dragonMenuIndex % 4;
                    if (col > 0) {
                        dragonMenuIndex = row * 4 + col - 1;
                        setChar(DRAGONS[dragonMenuIndex]);
                    }
                } else if (charSelectRow === 1) {
                    // 难度/模式区域，左右切换焦点
                    optionCol = 0; // 切换到难度
                }
                refreshCharCards(); SoundSystem.play('uiSelect');
            } else if (isRight(e.key)) {
                if (charSelectRow === 0) {
                    // 角色卡片区域右移
                    const row = Math.floor(dragonMenuIndex / 4);
                    const col = dragonMenuIndex % 4;
                    if (col < 3 && dragonMenuIndex + 1 < DRAGONS.length) {
                        dragonMenuIndex = row * 4 + col + 1;
                        setChar(DRAGONS[dragonMenuIndex]);
                    }
                } else if (charSelectRow === 1) {
                    // 难度/模式区域，左右切换焦点
                    optionCol = 1; // 切换到模式
                }
                refreshCharCards(); SoundSystem.play('uiSelect');
            } else if (e.key === 'Enter' || e.code === 'Space') {
                // 空格和回车功能一样
                // charSelectRow: 0=角色卡片, 1=难度/模式, 2=设置, 3=进入地牢, 4=测试
                e.preventDefault();
                if (charSelectRow === 0) confirmChar(); 
                else if (charSelectRow === 1) {
                    // 在难度/模式行，根据当前焦点切换对应选项
                    if (optionCol === 0) toggleDifficulty();
                    else toggleGameMode();
                }
                else if (charSelectRow === 2) { (window as any).openSettings?.(); }
                else if (charSelectRow === 3) confirmChar();
                else if (charSelectRow === 4) toggleTestMode();
            }
            return;
        }
    
        if (e.key === 'Escape') {
            // 在 Electron 中阻止 ESC 退出全屏
            if ((window as any).electron || navigator.userAgent.includes('Electron')) {
                e.preventDefault();
            }
            if (uiState === 'playing' || uiState === 'paused') togglePause();
            else if (uiState === 'encyclopedia') closeEncyclopedia();
            return;
        }
    
        if (uiState === 'paused') {
            if (isUp(e.key)) {
                pauseMenuIndex = (pauseMenuIndex - 1 + 4) % 4;
                updatePauseMenu(); SoundSystem.play('uiSelect');
            } else if (isDown(e.key)) {
                pauseMenuIndex = (pauseMenuIndex + 1) % 4;
                updatePauseMenu(); SoundSystem.play('uiSelect');
            } else if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                confirmPauseAction();
            }
            return;
        }
    
        if (uiState === 'encyclopedia') {
            if (isRight(e.key)) {
                wikiIndex = (wikiIndex + 1) % wikiItems.length;
                renderWikiGrid(); updateWikiDetails(); SoundSystem.play('uiSelect');
            } else if (isLeft(e.key)) {
                wikiIndex = (wikiIndex - 1 + wikiItems.length) % wikiItems.length;
                renderWikiGrid(); updateWikiDetails(); SoundSystem.play('uiSelect');
            } else if (isDown(e.key)) {
                wikiIndex = (wikiIndex + 4) % wikiItems.length; 
                renderWikiGrid(); updateWikiDetails(); SoundSystem.play('uiSelect');
            } else if (isUp(e.key)) {
                wikiIndex = (wikiIndex - 4 + wikiItems.length) % wikiItems.length;
                renderWikiGrid(); updateWikiDetails(); SoundSystem.play('uiSelect');
            } else if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                const item = wikiItems[wikiIndex];
                const pickupType = item.cat === 'WEAPON' ? 'weapon' : 'passive';
                tryPickup({ type: pickupType, data: item });
                const itemName = item.nameKey ? getText(item.nameKey) : item.name;
                const testLabel = getText('testGot');
                updateInventoryUI(); showToast(`${testLabel} ${itemName}`, item); SoundSystem.play('pickup');
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                const item = wikiItems[wikiIndex];
                removeItemStack(item.id, item.cat === 'WEAPON');
                const itemName = item.nameKey ? getText(item.nameKey) : item.name;
                const testLabel = getText('testRemoved');
                updateInventoryUI(); showToast(`${testLabel} ${itemName}`, "🗑️"); SoundSystem.play('uiSelect');
            }
            return;
        }
    
        if (uiState === 'levelup') {
            if (isLeft(e.key)) {
                selectedRewardIndex = (selectedRewardIndex - 1 + 3) % 3;
                renderLevelUpCards();
            } else if (isRight(e.key)) {
                selectedRewardIndex = (selectedRewardIndex + 1) % 3;
                renderLevelUpCards();
            } else if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                selectLevelUpReward(levelUpChoices[selectedRewardIndex]);
            }
            return;
        }
    
        if (uiState === 'gameover') {
            if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                goToCharSelect();
            }
            return;
        }
    
        if (uiState === 'playing') {
            if (isPaused) return;
            if (e.key === 'Enter') { togglePause(); return; }

            // P1 Controls
            if (snakes[0]) {
                const p1Dir = KEYS_ARROWS[e.key] || (numPlayers === 1 ? KEYS_WASD[e.key] : null);
                if (p1Dir) {
                    const lastVel = snakes[0].inputQueue.length > 0 
                        ? snakes[0].inputQueue[snakes[0].inputQueue.length - 1] 
                        : snakes[0].velocity;
                    if ((p1Dir.x !== 0 && lastVel.x === 0) || (p1Dir.y !== 0 && lastVel.y === 0)) {
                        // 限制队列长度为2，防止积累过多输入导致自动转弯
                        if (snakes[0].inputQueue.length < 2) {
                            snakes[0].inputQueue.push(p1Dir);
                        }
                    }
                }
            }

            // P2 Controls (WASD)
            if (numPlayers === 2 && snakes[1]) {
                 const p2Dir = KEYS_WASD[e.key];
                 if (p2Dir) {
                    const lastVel = snakes[1].inputQueue.length > 0 
                        ? snakes[1].inputQueue[snakes[1].inputQueue.length - 1] 
                        : snakes[1].velocity;
                    if ((p2Dir.x !== 0 && lastVel.x === 0) || (p2Dir.y !== 0 && lastVel.y === 0)) {
                        // 限制队列长度为2，防止积累过多输入导致自动转弯
                        if (snakes[1].inputQueue.length < 2) {
                            snakes[1].inputQueue.push(p2Dir);
                        }
                    }
                 }
            }
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const currentScale = (window as any).gameScale || 1;
        // 考虑缩放后的坐标转换
        mouseRef.current = {
            x: (e.clientX - rect.left) / currentScale,
            y: (e.clientY - rect.top) / currentScale
        };
    };

    let touchStartX = 0; let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
        if (isPaused || uiState !== 'playing') return;
        if (!snakes[0]) return;
        
        const dx = e.changedTouches[0].screenX - touchStartX;
        const dy = e.changedTouches[0].screenY - touchStartY;
        const lastVel = snakes[0].inputQueue.length > 0 ? snakes[0].inputQueue[snakes[0].inputQueue.length - 1] : snakes[0].velocity;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) { if (dx > 0 && lastVel.x === 0) snakes[0].inputQueue.push({x: 1, y: 0}); else if (dx < 0 && lastVel.x === 0) snakes[0].inputQueue.push({x: -1, y: 0}); }
        } else {
            if (Math.abs(dy) > 30) { if (dy > 0 && lastVel.y === 0) snakes[0].inputQueue.push({x: 0, y: 1}); else if (dy < 0 && lastVel.y === 0) snakes[0].inputQueue.push({x: 0, y: -1}); }
        }
    };

    // 在 Electron 中阻止 ESC 退出全屏（全局拦截）
    const handleEscapeFullscreen = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && ((window as any).electron || (window as any).electronAPI?.isElectron)) {
            if (document.fullscreenElement) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    };
    document.addEventListener('keydown', handleEscapeFullscreen, true); // capture phase

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouchStart, {passive: false});
    document.addEventListener('touchend', handleTouchEnd, {passive: false});

    init();

    return () => {
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        if (gamepadPollingId) cancelAnimationFrame(gamepadPollingId);
        document.removeEventListener('keydown', handleEscapeFullscreen, true);
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="main-wrapper" className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-black">
      <style>{`
        :root { --bg-color: #1a1a20; --ui-color: #d4af37; --danger-color: #b30000; --xp-color: #00ccff; --devour-color: #ff00ff; }
        * { letter-spacing: 0.1em; }
        html, body { margin: 0; padding: 0; overflow: hidden; background: #000; }
        .crt::before {
            content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            z-index: 2; background-size: 100% 2px, 3px 100%; pointer-events: none;
        }
        .inv-label { font-size: 12px; color: #666; writing-mode: vertical-lr; text-orientation: upright; letter-spacing: 2px; margin-right: 5px; }
        .inv-item { position: relative; width: 40px; height: 40px; background: #222; border: 1px solid #444; display: flex; justify-content: center; align-items: center; font-size: 24px; color: #fff; text-shadow: 1px 1px 0 #000; border-radius: 4px; cursor: help; }
        .inv-item.filled { border-color: var(--ui-color); background: #f0ebe0; }
        .inv-count { position: absolute; bottom: 0; right: 2px; font-size: 12px; color: #00ff00; font-weight: bold; text-shadow: 1px 1px 0 #000; }
        .bar-container { width: 100px; height: 8px; background: #333; border: 1px solid #555; position: relative; transition: width 0.5s; }
        .bar-fill { height: 100%; transition: width 0.2s; }
        #hp-bar { background: var(--danger-color); width: 100%; }
        #xp-bar { background: var(--xp-color); width: 0%; }
        #boss-hp-bar { background: #9000ff; width: 100%; }
        #boss-warning { animation: blink 0.5s infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        #toast { opacity: 0; transition: opacity 0.5s; pointer-events: none; }
        #toast.show { opacity: 1; }
        #inv-tooltip { display: none; position: absolute; background: #111; border: 1px solid #555; padding: 8px; z-index: 100; width: 180px; pointer-events: none; box-shadow: 0 0 10px rgba(0,0,0,0.8); }
        .btn { 
            background: linear-gradient(180deg, #800 0%, #600 50%, #400 100%); 
            border: 4px solid #300; 
            border-top-color: #500;
            border-left-color: #500;
            border-right-color: #200;
            border-bottom-color: #100;
            color: white; 
            padding: 18px 24px; 
            font-family: 'Press Start 2P', 'ZCOOL QingKe HuangYou', cursive; 
            font-size: 20px; 
            cursor: pointer; 
            margin-top: 10px; 
            box-shadow: 0 6px 0 #100, inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3); 
            transition: transform 0.1s; 
            width: 280px; 
            letter-spacing: 0.15em;
            text-shadow: 2px 2px 0 #300, -1px -1px 0 #500;
            position: relative;
        }
        .btn::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            right: 2px;
            height: 4px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #100, inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2); }
        .btn:hover { background: linear-gradient(180deg, #900 0%, #700 50%, #500 100%); }
        .btn.selected-btn { background: linear-gradient(180deg, #900 0%, #700 50%, #500 100%); transform: scale(1.05); box-shadow: 0 0 15px var(--ui-color), 0 6px 0 #100; }
        .selected-nav { border-color: var(--ui-color) !important; color: var(--ui-color) !important; }
        .char-card { 
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); 
            border: 4px solid #333; 
            border-top-color: #444;
            border-left-color: #444;
            border-right-color: #222;
            border-bottom-color: #111;
            padding: 20px; 
            width: 180px; 
            cursor: pointer; 
            text-align: center; 
            transition: 0.2s;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(0,0,0,0.3), 0 4px 0 #111;
        }
        .char-card:hover { transform: scale(1.05); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 0 #111; }
        .char-card.selected { 
            border: 4px solid #666; 
            border-top-color: #888;
            border-left-color: #888;
            background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%); 
            box-shadow: 0 0 20px var(--ui-color), inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 0 #111; 
            transform: scale(1.1); 
        }
        .char-card.focused { border: 4px solid #888; transform: scale(1.1); } 
        .char-card.locked { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); }
        .char-card-mini {
            width: 100%;
            height: 55px;
            background: #000;
            border: 2px solid #444;
            cursor: pointer;
            transition: 0.2s;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .char-card-mini img {
            width: 90px;
            height: 50px;
            object-fit: contain;
            pointer-events: none;
        }
        .char-card-mini:hover { border-color: #888; }
        .char-card-mini.selected {
            border-color: #aaa;
        }
        .char-card-mini.locked { opacity: 0.4; cursor: not-allowed; filter: grayscale(100%); }
        .char-card.dev-dragon { 
            opacity: 0.7; 
            cursor: pointer; 
            filter: sepia(30%);
            width: 100%;
            padding: 15px;
            min-width: 140px;
        }
        .char-card.dev-dragon:hover { 
            opacity: 1; 
            filter: sepia(0%);
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
        }
        #unlock-toggle.active { color: #00ff00; border-color: #00ff00; }
        .card { 
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); 
            border: 4px solid #333; 
            border-top-color: #444;
            border-left-color: #444;
            border-right-color: #222;
            border-bottom-color: #111;
            padding: 15px; 
            cursor: pointer; 
            transition: 0.2s; 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            max-width: 180px; 
            min-height: 400px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(0,0,0,0.3), 0 4px 0 #111;
        }
        .card.selected { 
            border: 4px solid #666;
            border-top-color: #888;
            border-left-color: #888;
            background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%); 
            transform: scale(1.05); 
            box-shadow: 0 0 15px var(--ui-color), inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 0 #111; 
        }
        #wiki-grid { display: grid; grid-template-columns: repeat(4, 48px); gap: 8px; overflow-y: auto; overflow-x: hidden; justify-content: center; padding: 5px; }
        .wiki-icon { display: flex; justify-content: center; align-items: center; font-size: 22px; background: #f0ebe0; border: 2px solid #444; cursor: pointer; width: 48px; height: 48px; aspect-ratio: 1; }
        .wiki-icon.selected { border-color: var(--ui-color); background: #f0ebe0; box-shadow: 0 0 10px var(--ui-color); }
        .changelog-row { border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 10px; }
      `}</style>

      <div 
        id="game-container" 
        ref={containerRef}
        className="relative shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-black crt"
        style={{
          width: '600px',
          height: '730px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <canvas ref={canvasRef} id="gameCanvas" width="600" height="660" className="block w-full bg-black image-pixelated" style={{height: '660px'}}></canvas>

        <div id="pause-btn" className="absolute top-[15px] right-[100px] pointer-events-auto cursor-pointer w-6 h-6 bg-black/50 border border-[#666] text-white flex justify-center items-center text-xs z-20 hover:bg-[#333] hover:border-[#d4af37] hover:text-[#d4af37] hidden" title={t.pauseHint}>⏸</div>

        <div id="hud" className="absolute top-[0px] left-[15px] flex flex-col gap-0 pointer-events-none z-[5] text-[12px] shadow-black drop-shadow-md">
            <div className="flex items-center gap-[10px]">
                <span className="w-[30px] text-right mr-[5px] color-[#aaa]">HP</span>
                <div className="bar-container relative flex items-center justify-center" id="hp-container">
                    <div id="hp-bar" className="bar-fill absolute left-0 top-0 h-full z-0"></div>
                    <span id="hp-text" className="relative z-10 text-[8px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">100/100</span>
                </div>
            </div>
            <div className="flex items-center gap-[10px]">
                <span className="w-[30px] text-right mr-[5px] color-[#aaa]">XP</span>
                <div className="bar-container relative flex items-center justify-center" id="xp-container">
                    <div id="xp-bar" className="bar-fill absolute left-0 top-0 h-full z-0"></div>
                    <span id="xp-text" className="relative z-10 text-[8px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">0/10</span>
                </div>
            </div>
            <div className="mt-1 text-[#ddd] text-[12px] flex gap-[15px]">
                <span>LVL <span id="level-display">1</span></span>
                <span>SCORE <span id="score-display">0</span></span>
                <span id="floor-display" style={{color: '#aaa'}}>FLOOR 1-1</span>
            </div>
        </div>

        <div id="boss-hp-container" className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[300px] hidden z-[5] flex flex-col items-center">
            <div id="boss-name" className="text-center text-[10px] mb-[2px] text-[#d8b4ff]">BOSS</div>
            <div className="bar-container w-full"><div id="boss-hp-bar" className="bar-fill"></div></div>
        </div>
        <div id="boss-warning" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 text-[24px] hidden drop-shadow-md z-[6] pointer-events-none w-full text-center">{t.bossWarning}</div>

        <div id="start-screen" className="overlay absolute -top-[4px] -left-[4px] flex flex-col justify-between items-center bg-black z-10 text-center pt-[60px] pb-[60px]" style={{width: 'calc(100% + 8px)', height: 'calc(100% + 8px)'}}>
            <div className="absolute top-[65px] right-[10px] cursor-pointer text-[#666] hover:text-[#d4af37] text-[10px] border border-[#333] px-2 py-1" onClick={() => setShowChangelog(true)}>{t.changelog}</div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <img src="./fengmian.png" alt="Dragon Destiny" className="mb-2" style={{width: '95%', maxWidth: '750px', height: 'auto', imageRendering: 'pixelated'}} />
                <p className="text-[14px] text-[#ccc] leading-normal my-1 mx-5" style={{fontSize: language === 'en' ? '12px' : '14px'}}>{t.clickToStart}</p>
            </div>
            <button id="btn-start-game" className="btn" style={{fontSize: language === 'en' ? '12px' : '14px'}}>{t.startGame}</button>
        </div>

        {showChangelog && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/95 z-50 flex flex-col items-center justify-center p-10">
                <h2 className="text-[#d4af37] text-xl mb-5">{t.changelogTitle}</h2>
                <div className="w-full h-full overflow-y-auto text-left border border-[#333] p-5 bg-[#111] mb-5">
                    {CHANGELOG.map((log, i) => (
                        <div key={i} className="changelog-row">
                            <div className="flex justify-between mb-2">
                                <span className="text-[#aaa] text-[10px]">{log.date}</span>
                                <span className="text-[#fff] text-[10px]">{log.ver}</span>
                            </div>
                            <div className="text-[#ccc] text-[10px] leading-relaxed">{log.desc}</div>
                        </div>
                    ))}
                </div>
                <button className="btn" style={{width:'150px'}} onClick={() => setShowChangelog(false)}>{t.close}</button>
            </div>
        )}

        {/* 设置面板 */}
        {showSettings && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/95 z-50 flex flex-col items-center justify-center">
                <h1 className="text-[#b30000] drop-shadow-md mb-8" style={{fontSize: language === 'en' ? '24px' : '28px'}}>⚙️ {t.settings}</h1>
                
                <div className="flex flex-col gap-[15px]">
                    {/* 音量 */}
                    <button 
                        className={`btn ${settingsOptions[settingsIndex] === 'volume' ? 'selected-btn' : ''}`}
                        style={{width: '220px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: language === 'en' ? '14px' : '20px'}}
                        onClick={() => setSettingsIndex(0)}
                    >
                        <span>{t.volume}</span>
                        <span style={{color: '#d4af37'}}>{Math.round(volume * 100)}%</span>
                    </button>
                    
                    {/* 语言 */}
                    <button 
                        className={`btn ${settingsOptions[settingsIndex] === 'language' ? 'selected-btn' : ''}`}
                        style={{width: '220px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: language === 'en' ? '11px' : '20px'}}
                        onClick={() => {
                            setSettingsIndex(1);
                            setLanguage(l => l === 'zh' ? 'en' : 'zh');
                        }}
                    >
                        <span>{t.language}</span>
                        <span style={{color: '#d4af37', fontSize: language === 'en' ? '10px' : '18px'}}>{language === 'zh' ? t.chinese : t.english}</span>
                    </button>
                    <div style={{fontSize: '10px', color: '#666', marginTop: '-5px', textAlign: 'center'}}>
                        {language === 'en' ? '(Restart required, Ctrl+R)' : '(需要重启游戏，Ctrl+R快速重启)'}
                    </div>
                    
                    {/* 全屏模式 - 仅 Electron */}
                    {isElectron && (
                        <button 
                            className={`btn ${settingsOptions[settingsIndex] === 'fullscreen' ? 'selected-btn' : ''}`}
                            style={{width: '220px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: language === 'en' ? '14px' : '20px'}}
                            onClick={() => {
                                setSettingsIndex(2);
                                toggleFullscreen();
                            }}
                        >
                            <span>{t.fullscreen}</span>
                            <span style={{color: '#d4af37'}}>{document.fullscreenElement ? 'ON' : 'OFF'}</span>
                        </button>
                    )}
                    
                    {/* 关闭按钮 */}
                    <button 
                        className={`btn ${settingsOptions[settingsIndex] === 'close' ? 'selected-btn' : ''}`}
                        style={{width: '220px', marginTop: '20px', fontSize: language === 'en' ? '14px' : '20px'}}
                        onClick={() => (window as any).closeSettings?.()}
                    >
                        {t.close} (ESC)
                    </button>
                </div>
                
                <div className="text-[#666] mt-6" style={{fontSize: language === 'en' ? '10px' : '12px'}}>
                    {settingsOptions[settingsIndex] === 'volume' && `← → ${t.adjustVolume}`}
                    {settingsOptions[settingsIndex] === 'language' && `Enter/← → ${t.toggleLanguage}`}
                    {settingsOptions[settingsIndex] === 'fullscreen' && `Enter ${t.toggleFullscreen}`}
                    {settingsOptions[settingsIndex] === 'close' && `Enter ${t.closeSettings}`}
                </div>
            </div>
        )}

        <div id="char-select-screen" className="overlay hidden absolute -top-[4px] -left-[4px] flex flex-col justify-between items-center bg-black z-10 text-center px-[10px] pt-[10px] pb-[60px]" style={{width: 'calc(100% + 8px)', height: 'calc(100% + 8px)'}}>
            {/* 右上角百科全书按钮 - 上移30px */}
            <div id="wiki-btn-select" className="absolute top-[-25px] right-[10px] w-[50px] h-[30px] text-lg cursor-pointer text-[#666] hover:text-[#aaa] hover:scale-110 transition bg-[#1a1a1a] flex items-center justify-center rounded" title={t.encyclopedia}>📖</div>
            
            {/* 8个角色小卡片 (4列x2行) - 去掉文字 */}
            <div className="grid grid-cols-4 gap-[5px] w-full" id="char-grid">
                <div className="char-card-mini selected" id="char-fire">
                    <img src="./shadow-dragon.png" alt="烈焰魔龙" />
                </div>
                <div className="char-card-mini" id="char-ice">
                    <img src="./void-dragon.png" alt="凛冬冰龙" />
                </div>
                <div className="char-card-mini" id="char-poison">
                    <img src="./thunder-dragon.png" alt="剧毒腐龙" />
                </div>
                <div className="char-card-mini locked" id="char-plasma">
                    <img src="./earth-dragon.png" alt="电浆能量兽" />
                </div>
                <div className="char-card-mini locked" id="char-side">
                    <img src="./light-dragon.png" alt="海战巨鯨" />
                </div>
                <div className="char-card-mini locked" id="char-rapid">
                    <img src="./wind-dragon.png" alt="风暴迅猛兽" />
                </div>
                <div className="char-card-mini locked" id="char-heavy">
                    <img src="./water-dragon.png" alt="炮火巨兽" />
                </div>
                <div className="char-card-mini locked" id="char-triple">
                    <img src="./metal-dragon.png" alt="三头金蛇" />
                </div>
            </div>
            
            {/* 角色放大显示和属性介绍 */}
            <div id="char-detail-panel" className="w-full flex flex-col items-center">
                <h1 id="char-select-title" className="text-[#888] drop-shadow-md text-[16px] mb-[2px]">选择巨龙</h1>
                <div className="flex flex-col items-center justify-start w-full">
                    {/* 大图 */}
                    <div className="flex items-center justify-center mt-[-65px]">
                        <img id="char-detail-img" src="./shadow-dragon.png" alt="" className="w-[400px] h-[400px] object-contain" />
                    </div>
                    {/* 属性信息在图片下方 - 字体放大1倍，整体上移 */}
                    <div id="char-detail" className="flex flex-col items-center justify-center text-center mt-[-130px]">
                        <h2 id="char-detail-name" className="text-[36px] text-[#ccc] tracking-wider mb-[8px]">烈焰魔龙</h2>
                        <p id="char-detail-weapon" className="text-[24px] text-[#888] mb-[6px]">初始武器: <span className="text-[#aaa]">龙息</span></p>
                        <p id="char-detail-desc" className="text-[20px] text-[#666] italic mb-[6px]">标准的远程火球</p>
                        <p id="char-detail-stats" className="text-[18px] text-[#555]">伤害加成: +20%</p>
                    </div>
                </div>
                <img id="char-preview-img1" src="./shadow-dragon.png" alt="" className="hidden" />
                <img id="char-preview-img2" src="./shadow-dragon.png" alt="" className="hidden" />
            </div>
            
            {/* 底部区域 */}
            <div className="flex flex-col items-center w-full">
                {/* 游戏选项按钮 - 深红色 */}
                <div className="flex flex-row gap-[15px] mb-[6px]">
                    <button id="btn-difficulty" className="btn" style={{fontSize: '12px', padding: '6px 12px', width: '130px', background: 'linear-gradient(180deg, #600 0%, #400 100%)', border: 'none'}}>难度: 普通</button>
                    <button id="btn-mode" className="btn" style={{fontSize: '12px', padding: '6px 12px', width: '130px', background: 'linear-gradient(180deg, #600 0%, #400 100%)', border: 'none'}}>模式: 单人</button>
                </div>

                {/* 设置按钮 */}
                <button 
                    id="btn-char-settings"
                    className="btn mb-[6px]" 
                    style={{fontSize: '12px', padding: '6px 12px', width: '130px', background: 'linear-gradient(180deg, #600 0%, #400 100%)', border: 'none'}}
                >
                    ⚙️ {t.settings}
                </button>

                <p id="lock-msg" className="text-[#666] h-3 text-[11px] mb-[4px]"></p>

                {/* 进入地牢按钮 - 深红色 */}
                <button id="btn-confirm-char" className="btn" style={{fontSize: '16px', padding: '10px 18px', width: '280px', background: 'linear-gradient(180deg, #800 0%, #500 100%)', border: 'none'}}>进入地牢</button>
                
                {/* 测试按钮 - 紧挨进入地牢下方 */}
                <button id="unlock-toggle" className="text-[9px] text-[#555] cursor-pointer bg-[#111] px-[6px] py-[3px] tracking-normal rounded mt-[5px]">[测试] 全解锁: OFF</button>
            </div>
        </div>



        <div id="levelup-screen" className="overlay hidden absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black/95 z-10 text-center">
            <h1 style={{color: 'var(--ui-color)', fontSize: language === 'en' ? '24px' : '32px', letterSpacing: language === 'en' ? '0.05em' : '0.1em'}} className="mb-5 tracking-wider">{t.bloodAwakening}</h1>
            <div id="wiki-btn-levelup" className="absolute top-[20px] right-[20px] text-xl cursor-pointer text-[#aaa] bg-[#222] border-2 border-[#444] p-2 rounded z-25 hover:text-[#d4af37]" title={t.encyclopedia}>📖</div>
            <p className="text-[#ccc] my-1" style={{fontSize: language === 'en' ? '14px' : '20px', letterSpacing: language === 'en' ? '0.02em' : '0.1em'}}>{t.selectEnhance}</p>
            <div id="cards-container" className="flex flex-col sm:flex-row gap-[10px] w-[95%] max-w-[580px] justify-center"></div>
        </div>

        <div id="pause-screen" className="overlay hidden absolute top-0 left-0 w-full flex flex-col justify-center items-center bg-black/95 z-10 text-center" style={{height: 'calc(100% - 70px)'}}>
            <h1 className="text-[#b30000] drop-shadow-md text-[28px] mb-5">{t.paused}</h1>
            <div id="pause-menu-options" className="flex flex-col gap-[15px]">
                <button id="btn-resume" className="btn selected-btn">{t.resume}</button>
                <button id="btn-settings" className="btn">{t.settings}</button>
                <button id="btn-wiki" className="btn">{t.encyclopedia}</button>
                <button id="btn-restart" className="btn">{t.restart}</button>
            </div>

        </div>

        <div id="encyclopedia-screen" className="overlay hidden absolute top-0 left-0 w-full flex flex-col justify-center items-center bg-black/95 z-10 text-center" style={{height: 'calc(100% - 70px)'}}>
            <h1 className="text-white mb-5" style={{fontSize: language === 'en' ? '20px' : '24px'}}>{t.encyclopediaTitle}</h1>
            <div id="encyclopedia-content" className="flex w-[80%] h-[70%] gap-[20px] text-left">
                <div id="wiki-grid" className="flex-1 border border-[#333] bg-[#111] p-[5px]"></div>
                <div id="wiki-details" className="flex-1 border border-[#333] bg-[#111] p-[20px] flex flex-col gap-[10px]">
                    <div id="wiki-title" className="text-[#d4af37] mb-[10px] border-b border-[#333] pb-[5px]" style={{fontSize: language === 'en' ? '18px' : '24px'}}>{t.selectItem}</div>
                    <div id="wiki-stats" className="text-[#aaa] leading-relaxed" style={{fontSize: language === 'en' ? '13px' : '16px'}}></div>
                    <div id="wiki-upgrade" className="text-[#0f0] mt-[10px] leading-relaxed" style={{fontSize: language === 'en' ? '13px' : '16px'}}></div>
                </div>
            </div>

            <button id="btn-close-wiki" className="btn" style={{fontSize: language === 'en' ? '12px' : '14px'}}>{t.returnEsc}</button>
        </div>

        <div id="gameover-screen" className="overlay hidden absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black/95 z-10 text-center">
            <h1 id="go-title" className="text-[#666] text-[28px] mb-5 drop-shadow-md">{t.youDied}</h1>
            <p className="text-[#ccc] leading-loose" style={{fontSize: language === 'en' ? '14px' : '16px'}}>{t.journeyEnds}</p>
            <p className="text-[#ccc] leading-loose" style={{fontSize: language === 'en' ? '14px' : '16px'}}>{t.floorReached}: <span id="final-floor"></span></p>
            <p className="text-[#ccc] leading-loose" style={{fontSize: language === 'en' ? '14px' : '16px'}}>{t.finalScore}: <span id="final-score"></span></p>

            <button id="btn-restart-gameover" className="btn" style={{fontSize: language === 'en' ? '14px' : '16px'}}>{t.awakenAgain}</button>
        </div>

        <div id="mobile-controls" className="hidden absolute bottom-[70px] w-full text-center text-[10px] text-white/30 pointer-events-none sm:hidden">{t.swipeToMove}</div>
        
        <div id="inventory-panel" className="absolute bottom-0 left-0 w-full bg-black/80 p-[10px] box-border flex justify-center items-center gap-[40px] border-t border-[#333] z-20">
            <div className="flex items-center gap-[8px]">
                <div id="inv-weapons" className="flex gap-[8px]"></div>
            </div>

            <div id="inv-tooltip"></div>
            <div id="toast" className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-black/80 border border-[#d4af37] px-4 py-2 text-[#d4af37] text-sm z-20 text-center whitespace-nowrap"></div>

            <div className="flex items-center gap-[8px]">
                <div id="inv-passives" className="flex gap-[8px]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
