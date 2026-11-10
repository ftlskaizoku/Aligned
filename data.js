/* ------------------------------------------------------------------
   CONTENT FILE – edit this to change exercises or the weekly plan.
   The app code (app.js) never needs to change for new content.

   Each exercise:
     id, name, area, level, cues[], search (YouTube search text),
     video (optional URL – or paste links inside the app),
     a / b  = start and end pose for the illustration
   Each plan item:
     ex (exercise id), block (warm-up | main | cool-down),
     sets, reps OR secs, rest (seconds), express (true = in the short version)
------------------------------------------------------------------- */

/* ---- stick-figure poses (side view, 100x100 box, floor at y=91) ---- */
const P = (base, over) => Object.assign({}, base, over);
const STAND = { h:[50,14], n:[50,26], p:[50,56], k:[50,74], f:[53,90], e:[50,42], w:[50,56] };
const SUP   = { h:[14,84], n:[24,86], p:[52,86], k:[64,66], f:[74,88], e:[36,88], w:[46,88] };
const QUAD  = { h:[16,52], n:[28,54], p:[62,54], k:[62,86], f:[82,88], e:[28,72], w:[28,88] };
const HALFK = { h:[44,14], n:[44,26], p:[44,58], k:[40,88], f:[18,90], e:[44,42], w:[44,58], k2:[66,62], f2:[66,88] };
const BRIDGE = P(SUP, { p:[52,66], k:[66,60], f:[76,88] });

window.EXERCISES = [
  { id:'catcow', name:'Cat–cow', area:'Spine / warm-up', level:'Beginner',
    cues:['Move slowly with your breath','Round the back, then lift the chest','Keep the movement pain-free'],
    search:'cat cow exercise', a:P(QUAD,{h:[16,44],n:[28,50],p:[62,48]}), b:P(QUAD,{h:[20,66],n:[28,60],p:[62,58]}) },
  { id:'tilt', name:'Pelvic tilts', area:'Pelvis', level:'Beginner',
    cues:['Lie on your back, knees bent','Flatten your lower back into the floor, then release','Small, controlled movement'],
    search:'pelvic tilt exercise', a:P(SUP,{p:[52,83]}), b:P(SUP,{p:[52,87]}) },
  { id:'bridge', name:'Glute bridge', area:'Pelvis', level:'Beginner',
    cues:['Push through your heels','Squeeze the glutes at the top','Ribs down, do not over-arch the back'],
    search:'glute bridge exercise form', a:SUP, b:BRIDGE },
  { id:'hipflex', name:'Hip flexor stretch', area:'Pelvis', level:'Beginner',
    cues:['Tuck the tailbone under','Shift the hips gently forward','Feel the stretch at the front of the hip'],
    search:'half kneeling hip flexor stretch', a:HALFK, b:P(HALFK,{h:[52,14],n:[52,26],p:[52,58],e:[52,42],w:[52,58],k:[44,88],f:[22,90],k2:[72,62],f2:[72,88]}) },
  { id:'squat', name:'Bodyweight squat', area:'Pelvis / legs', level:'Beginner',
    cues:['Feet shoulder-width apart','Sit back and down, chest tall','Knees follow the direction of the toes'],
    search:'bodyweight squat proper form', a:STAND, b:{ h:[54,28], n:[52,40], p:[32,68], k:[62,66], f:[56,90], e:[62,46], w:[74,50] } },
  { id:'slbridge', name:'Single-leg glute bridge', area:'Pelvis', level:'Intermediate',
    cues:['Keep the hips level','Drive through the heel of the working leg','Lower slowly'],
    search:'single leg glute bridge', a:P(BRIDGE,{k2:[66,60],f2:[76,88]}), b:P(BRIDGE,{k2:[72,56],f2:[90,46]}) },
  { id:'deadbug', name:'Dead bug', area:'Core / pelvis', level:'Intermediate',
    cues:['Lower back stays in contact with the floor','Move opposite arm and leg slowly','Breathe out as you extend'],
    search:'dead bug exercise', a:P(SUP,{k:[52,62],f:[68,62],e:[26,70],w:[26,54]}), b:P(SUP,{k:[72,78],f:[90,86],e:[10,86],w:[2,86]}) },
  { id:'birddog', name:'Bird dog', area:'Core / back', level:'Intermediate',
    cues:['Keep the back flat like a table','Reach long, not high','Pause one second at the top'],
    search:'bird dog exercise', a:QUAD, b:P(QUAD,{e:[18,52],w:[6,50],k:[80,56],f:[96,58]}) },
  { id:'wallangel', name:'Wall angels', area:'Shoulders', level:'Beginner',
    cues:['Back and head against the wall','Slide the arms up and down','Keep ribs down, no arching'],
    search:'wall angels exercise', a:P(STAND,{e:[48,38],w:[56,26]}), b:P(STAND,{e:[50,24],w:[54,4]}) },
  { id:'pullapart', name:'Band pull-aparts / scapular squeezes', area:'Shoulders', level:'Beginner',
    cues:['Pull the shoulder blades back and down','No shrugging','Control the return'],
    search:'band pull apart exercise', a:P(STAND,{e:[62,34],w:[76,34]}), b:P(STAND,{e:[52,34],w:[60,36]}) },
  { id:'chest', name:'Doorway chest stretch', area:'Shoulders', level:'Beginner',
    cues:['Forearm on the door frame','Step through gently','Breathe, do not force it'],
    search:'doorway chest stretch', a:STAND, b:P(STAND,{e:[36,30],w:[30,16]}) },
  { id:'chinlying', name:'Chin tucks (lying)', area:'Neck', level:'Beginner',
    cues:['Make a gentle "double chin"','Back of the head stays on the floor','Very gentle – stop if there is pain'],
    search:'chin tucks lying down neck exercise', a:P(SUP,{h:[10,82]}), b:P(SUP,{h:[16,86]}) },
  { id:'chinwall', name:'Chin tucks (standing at wall)', area:'Neck', level:'Beginner',
    cues:['Back of head touches the wall','Glide the chin straight back','Hold 2–3 seconds'],
    search:'standing chin tuck against wall', a:P(STAND,{h:[58,16]}), b:STAND },
  { id:'neckside', name:'Side neck stretch', area:'Neck', level:'Beginner',
    cues:['Ear toward shoulder, no force','Keep the opposite shoulder down','Gentle only'],
    search:'side neck stretch upper trapezius', a:STAND, b:P(STAND,{h:[56,16],w:[58,8],e:[62,26]}) },
  { id:'wallstand', name:'Wall posture check', area:'Full body', level:'Beginner',
    cues:['Heels, hips, shoulders and head near the wall','Tall spine, relaxed shoulders','Breathe normally'],
    search:'wall posture check standing alignment', a:STAND, b:STAND }
];

/* ---- weekly plan: index = JS day number (0 Sun … 6 Sat) ---- */
const W = (ex,block,sets,opt) => Object.assign({ ex, block, sets, rest:30 }, opt);
const MOB = [ W('catcow','main',2,{reps:10,rest:15,express:true}), W('hipflex','main',1,{secs:40,rest:15,express:true}), W('chest','main',1,{secs:40,rest:0,express:true}) ];
window.PLAN = {
  1: { title:'Pelvis – foundation', focus:'Pelvis alignment basics', items:[
    W('catcow','warm-up',3,{reps:12,rest:20}),
    W('tilt','warm-up',2,{reps:10,rest:15}),
    W('bridge','main',4,{reps:12,rest:45,express:true}),
    W('hipflex','main',3,{secs:45,rest:20,express:true}),
    W('squat','main',4,{reps:12,rest:45,express:true}),
    W('tilt','main',3,{reps:15,rest:30}),
    W('hipflex','cool-down',2,{secs:40,rest:15}),
    W('chest','cool-down',1,{secs:40,rest:0}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  2: { title:'Pelvis – variation', focus:'Same area, new exercises, a bit harder', items:[
    W('catcow','warm-up',3,{reps:12,rest:20}),
    W('tilt','warm-up',2,{reps:10,rest:15}),
    W('slbridge','main',4,{reps:10,rest:45,express:true}),
    W('deadbug','main',4,{reps:8,rest:40,express:true}),
    W('birddog','main',4,{reps:8,rest:40,express:true}),
    W('squat','main',3,{reps:12,rest:45}),
    W('hipflex','main',3,{secs:45,rest:20}),
    W('chest','cool-down',1,{secs:40,rest:0}),
    W('wallstand','cool-down',1,{secs:45,rest:0}) ]},
  3: { title:'Shoulders', focus:'Shoulder imbalances', items:[
    W('catcow','warm-up',3,{reps:12,rest:20}),
    W('pullapart','warm-up',2,{reps:12,rest:15}),
    W('wallangel','main',4,{reps:10,rest:40,express:true}),
    W('pullapart','main',4,{reps:15,rest:40,express:true}),
    W('chest','main',3,{secs:45,rest:20,express:true}),
    W('birddog','main',3,{reps:8,rest:40}),
    W('hipflex','main',2,{secs:40,rest:15}),
    W('neckside','cool-down',2,{secs:30,rest:10}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  4: { title:'Neck', focus:'Gentle neck work – low intensity', items:[
    W('chinlying','warm-up',3,{reps:10,rest:20}),
    W('catcow','warm-up',2,{reps:10,rest:15}),
    W('chinlying','main',3,{reps:12,rest:30,express:true}),
    W('chinwall','main',4,{reps:10,rest:35,express:true}),
    W('pullapart','main',3,{reps:12,rest:35}),
    W('neckside','main',3,{secs:30,rest:15,express:true}),
    W('wallangel','main',3,{reps:10,rest:35}),
    W('chest','main',2,{secs:40,rest:15}),
    W('chinwall','cool-down',1,{reps:10,rest:0}),
    W('neckside','cool-down',1,{secs:30,rest:0}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  5: { title:'Full body', focus:'Recap of the week', items:[
    W('catcow','warm-up',3,{reps:12,rest:20}),
    W('tilt','warm-up',2,{reps:10,rest:15}),
    W('bridge','main',3,{reps:12,rest:40,express:true}),
    W('deadbug','main',3,{reps:8,rest:40}),
    W('wallangel','main',3,{reps:10,rest:35,express:true}),
    W('chinwall','main',3,{reps:10,rest:35}),
    W('hipflex','main',2,{secs:40,rest:20,express:true}),
    W('pullapart','main',3,{reps:12,rest:35}),
    W('chest','cool-down',1,{secs:40,rest:0}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  6: { title:'Mobility (optional)', focus:'Rest day or a light mobility flow', items: MOB },
  0: { title:'Mobility (optional)', focus:'Rest day or a light mobility flow', items: MOB }
};
