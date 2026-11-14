/* ------------------------------------------------------------------
   CONTENT FILE – edit this to change exercises or the weekly plan.
   The app code (app.js) never needs to change for new content.

   Each exercise:
     id, name, area, level, cues[], search (YouTube search text),
     videos (list of files like 'Videos/v09.mp4'; the first one is the main video).
            Thumbnails are automatic: thumbs/v09.jpg is used as the picture for Videos/v09.mp4.
     video (optional single YouTube link or file),
     image (optional: URL or file path like 'images/bridge.jpg' – replaces the drawing;
            you can also add images from inside the app on the Exercises tab),
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
  { id:'catcow', name:'Cat–cow', area:'Spine / warm-up', level:'Beginner', videos:['Videos/v11.mp4','Videos/v35.mp4'],
    cues:['Move slowly with your breath','Round the back, then lift the chest','Keep the movement pain-free'],
    search:'cat cow exercise', a:P(QUAD,{h:[16,44],n:[28,50],p:[62,48]}), b:P(QUAD,{h:[20,66],n:[28,60],p:[62,58]}) },
  { id:'tilt', name:'Pelvic tilts', area:'Pelvis', level:'Beginner', videos:['Videos/v06.mp4','Videos/v14.mp4','Videos/v02.mp4','Videos/v30.mp4'],
    cues:['Lie on your back, knees bent','Flatten your lower back into the floor, then release','Small, controlled movement'],
    search:'pelvic tilt exercise', a:P(SUP,{p:[52,83]}), b:P(SUP,{p:[52,87]}) },
  { id:'legs90', name:'Legs-up 90/90 breathing', area:'Pelvis / hips', level:'Beginner', videos:['Videos/v25.mp4','Videos/v10.mp4','Videos/v24.mp4','Videos/v23.mp4','Videos/v26.mp4','Videos/v09.mp4'],
    cues:['Lie on your back, calves on a chair, wall or box','Slow breaths into the belly and lower ribs','Let the lower back relax into the floor'],
    search:'90 90 breathing legs on chair', a:SUP, b:P(SUP,{k:[68,66],f:[88,62]}) },
  { id:'hipflex', name:'Hip flexor stretch', area:'Pelvis', level:'Beginner', videos:['Videos/v09.mp4','Videos/v24.mp4','Videos/v26.mp4','Videos/v10.mp4'],
    cues:['Tuck the tailbone under','Shift the hips gently forward','Feel the stretch at the front of the hip'],
    search:'half kneeling hip flexor stretch', a:HALFK, b:P(HALFK,{h:[52,14],n:[52,26],p:[52,58],e:[52,42],w:[52,58],k:[44,88],f:[22,90],k2:[72,62],f2:[72,88]}) },
  { id:'bridge', name:'Glute bridge', area:'Pelvis', level:'Beginner', videos:['Videos/v23.mp4','Videos/v02.mp4'],
    cues:['Push through your heels','Squeeze the glutes at the top','Ribs down, do not over-arch the back'],
    search:'glute bridge exercise form', a:SUP, b:BRIDGE },
  { id:'slbridge', name:'Single-leg glute bridge', area:'Pelvis', level:'Intermediate', videos:['Videos/v02.mp4'],
    cues:['Keep the hips level','Drive through the heel of the working leg','Hold 2 seconds at the top, lower slowly'],
    search:'single leg glute bridge', a:P(BRIDGE,{k2:[66,60],f2:[76,88]}), b:P(BRIDGE,{k2:[72,56],f2:[90,46]}) },
  { id:'deadbug', name:'Dead bug / leg lowering', area:'Core / pelvis', level:'Intermediate', videos:['Videos/v02.mp4'],
    cues:['Lower back stays in contact with the floor','Lower one leg slowly, then switch','Breathe out as you extend'],
    search:'dead bug exercise', a:P(SUP,{k:[52,62],f:[68,62],e:[26,70],w:[26,54]}), b:P(SUP,{k:[72,78],f:[90,86],e:[10,86],w:[2,86]}) },
  { id:'squat', name:'Squat / split squat', area:'Pelvis / legs', level:'Beginner', videos:['Videos/v31.mp4','Videos/v32.mp4'],
    cues:['Feet shoulder-width apart','Sit back and down, chest tall','Knees follow the direction of the toes'],
    search:'goblet squat proper form', a:STAND, b:{ h:[54,28], n:[52,40], p:[32,68], k:[62,66], f:[56,90], e:[62,46], w:[74,50] } },
  { id:'foot', name:'Foot control (knee-over-foot)', area:'Feet / legs', level:'Beginner', videos:['Videos/v15.mp4'],
    cues:['Keep the foot rooted: big toe, little toe and heel','Let the knee track over the foot','Slow and controlled'],
    search:'foot pronation knee to step exercise', a:STAND, b:P(STAND,{k:[58,72],f:[60,90]}) },
  { id:'birddog', name:'Bird dog', area:'Core / back', level:'Intermediate', 
    cues:['Keep the back flat like a table','Reach long, not high','Pause one second at the top'],
    search:'bird dog exercise', a:QUAD, b:P(QUAD,{e:[18,52],w:[6,50],k:[80,56],f:[96,58]}) },
  { id:'wallstand', name:'Wall posture stand', area:'Full body', level:'Beginner', videos:['Videos/v21.mp4','Videos/v30.mp4'],
    cues:['Heels, hips, shoulders and head near the wall','Find a neutral pelvis, tall spine, relaxed shoulders','Breathe normally'],
    search:'wall posture check standing alignment', a:STAND, b:STAND },
  { id:'wallraise', name:'Wall band shoulder raise', area:'Shoulders', level:'Beginner', videos:['Videos/v16.mp4','Videos/v27.mp4','Videos/v33.mp4'],
    cues:['Back against the wall, ribs down','Raise the arm slowly, no shrugging','Stop where you still feel relaxed'],
    search:'wall band shoulder raise posture', a:P(STAND,{e:[50,40],w:[56,52]}), b:P(STAND,{e:[58,30],w:[80,26]}) },
  { id:'bandrow', name:'Band shoulder position work', area:'Shoulders', level:'Beginner', videos:['Videos/v07.mp4','Videos/v08.mp4'],
    cues:['Set the shoulder blade back and down first','Pull through the band with control','No shrugging'],
    search:'band shoulder blade position exercise', a:P(STAND,{e:[62,34],w:[76,34]}), b:P(STAND,{e:[52,34],w:[60,36]}) },
  { id:'wallangel', name:'Wall slides / wall angels', area:'Shoulders', level:'Beginner', videos:['Videos/v29.mp4'],
    cues:['Forearms on the wall, ribs down','Slide the arms up and down slowly','Let the shoulder blades move freely'],
    search:'wall slides exercise', a:P(STAND,{e:[48,38],w:[56,26]}), b:P(STAND,{e:[50,24],w:[54,4]}) },
  { id:'chest', name:'Doorway chest stretch', area:'Shoulders / chest', level:'Beginner', videos:['Videos/v11.mp4','Videos/v29.mp4','Videos/v20.mp4'],
    cues:['Forearms on the door frame','Step through gently and hold about 45 seconds','Breathe, do not force it'],
    search:'doorway chest stretch', a:STAND, b:P(STAND,{e:[36,30],w:[30,16]}) },
  { id:'sidelying', name:'Side-lying rib & shoulder rotation', area:'Ribs / shoulders', level:'Beginner', videos:['Videos/v03.mp4','Videos/v05.mp4','Videos/v18.mp4','Videos/v35.mp4'],
    cues:['Lie on your side, knees bent, head supported','Rotate the top arm and chest slowly','Breathe into the ribs on the open side'],
    search:'side lying thoracic rotation open book', a:P(SUP,{e:[36,88],w:[46,88]}), b:P(SUP,{e:[30,72],w:[20,60]}) },
  { id:'sidestretch', name:'Kneeling side stretch', area:'Side body / spine', level:'Beginner', videos:['Videos/v22.mp4'],
    cues:['Kneel with one hand on a box or bench','Reach over and breathe into the stretched side','Stay relaxed'],
    search:'kneeling side stretch on box', a:STAND, b:P(STAND,{h:[60,16],n:[54,26],w:[62,6],e:[56,30]}) },
  { id:'proneup', name:'Prone press-up / chest opening', area:'Upper back / chest', level:'Beginner', videos:['Videos/v34.mp4','Videos/v14.mp4','Videos/v11.mp4'],
    cues:['Lie face down, prop on your elbows','Slide the shoulder blades down and away from the neck','Relax the lower back, keep the neck long'],
    search:'prone press up elbows thoracic extension', a:{ h:[14,86], n:[24,86], p:[62,88], k:[80,88], f:[94,88], e:[28,88], w:[34,88] }, b:{ h:[18,64], n:[26,72], p:[62,86], k:[80,88], f:[94,88], e:[30,88], w:[36,88] } },
  { id:'thoracic', name:'Foam-roller upper back extension', area:'Upper back', level:'Beginner', videos:['Videos/v01.mp4'],
    cues:['Roller under the mid or upper back, hands behind the head','Breathe out and let the upper back extend over the roller','Move the roller slightly higher and repeat'],
    search:'foam roller thoracic extension', a:P(SUP,{p:[52,86]}), b:P(SUP,{h:[10,70],n:[22,78]}) },
  { id:'chinlying', name:'Chin tucks (lying)', area:'Neck', level:'Beginner', videos:['Videos/v17.mp4','Videos/v01.mp4','Videos/v13.mp4'],
    cues:['Make a gentle "double chin"','Back of the head stays on the floor','Very gentle – stop if there is pain'],
    search:'chin tucks lying down neck exercise', a:P(SUP,{h:[10,82]}), b:P(SUP,{h:[16,86]}) },
  { id:'chinwall', name:'Chin tucks (standing at wall)', area:'Neck', level:'Beginner', videos:['Videos/v17.mp4','Videos/v01.mp4','Videos/v04.mp4'],
    cues:['Back of head touches the wall','Glide the chin straight back, do not just pull it back hard','Hold 2–3 seconds'],
    search:'standing chin tuck against wall', a:P(STAND,{h:[58,16]}), b:STAND },
  { id:'neckbreath', name:'Neck & rib breathing (legs on chair)', area:'Neck / breathing', level:'Beginner', videos:['Videos/v13.mp4','Videos/v04.mp4','Videos/v12.mp4','Videos/v20.mp4'],
    cues:['Lie on your back, calves on a chair','Breathe slowly into the lower ribs','Keep the neck and upper traps relaxed'],
    search:'breathing exercise neck tension lying legs on chair', a:SUP, b:P(SUP,{p:[52,84],k:[66,62],f:[84,62]}) },
  { id:'neckside', name:'Side neck stretch', area:'Neck', level:'Beginner', 
    cues:['Ear toward shoulder, no force','Keep the opposite shoulder down','Gentle only'],
    search:'side neck stretch upper trapezius', a:STAND, b:P(STAND,{h:[56,16],w:[58,8],e:[62,26]}) },
  { id:'pullapart', name:'Band pull-aparts / scapular squeezes', area:'Shoulders', level:'Beginner', 
    cues:['Pull the shoulder blades back and down','No shrugging','Control the return'],
    search:'band pull apart exercise', a:P(STAND,{e:[62,34],w:[76,34]}), b:P(STAND,{e:[52,34],w:[60,36]}) }
];

/* ---- weekly plan: index = JS day number (0 Sun … 6 Sat) ---- */
const W = (ex,block,sets,opt) => Object.assign({ ex, block, sets, rest:30 }, opt);
const MOB = [ W('catcow','main',2,{reps:10,rest:15,express:true}), W('hipflex','main',1,{secs:40,rest:15,express:true}), W('chest','main',1,{secs:40,rest:0,express:true}) ];
window.PLAN = {
  1: { title:'Pelvis – foundation', focus:'Pelvis alignment basics', items:[
    W('catcow','warm-up',2,{reps:10,rest:15}),
    W('tilt','warm-up',2,{reps:10,rest:15,express:true}),
    W('legs90','main',1,{secs:420,rest:0,express:true}),
    W('hipflex','main',3,{secs:45,rest:20,express:true}),
    W('bridge','main',4,{reps:12,rest:45,express:true}),
    W('tilt','main',4,{reps:15,rest:30}),
    W('hipflex','cool-down',2,{secs:40,rest:15}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  2: { title:'Pelvis – variation', focus:'Same area, new exercises, a bit harder', items:[
    W('catcow','warm-up',2,{reps:10,rest:15}),
    W('tilt','warm-up',2,{reps:10,rest:15}),
    W('slbridge','main',4,{reps:10,rest:45,express:true}),
    W('deadbug','main',4,{reps:8,rest:40,express:true}),
    W('squat','main',4,{reps:10,rest:45,express:true}),
    W('foot','main',3,{reps:10,rest:30}),
    W('legs90','cool-down',1,{secs:360,rest:0}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  3: { title:'Shoulders', focus:'Shoulder imbalances', items:[
    W('catcow','warm-up',2,{reps:10,rest:15}),
    W('sidelying','warm-up',3,{reps:8,rest:20}),
    W('wallraise','main',4,{reps:12,rest:45,express:true}),
    W('bandrow','main',4,{reps:12,rest:40,express:true}),
    W('wallangel','main',4,{reps:12,rest:40,express:true}),
    W('proneup','main',4,{secs:30,rest:30}),
    W('chest','cool-down',2,{secs:45,rest:15,express:true}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  4: { title:'Neck', focus:'Gentle neck work – low intensity', items:[
    W('neckbreath','warm-up',1,{secs:360,rest:0}),
    W('chinlying','main',3,{reps:10,rest:30,express:true}),
    W('chinwall','main',4,{reps:10,rest:35,express:true}),
    W('thoracic','main',3,{secs:40,rest:20,express:true}),
    W('sidestretch','main',3,{secs:40,rest:20}),
    W('neckside','main',2,{secs:30,rest:15}),
    W('pullapart','main',3,{reps:12,rest:35}),
    W('chinwall','cool-down',1,{reps:10,rest:0}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  5: { title:'Full body', focus:'Recap of the week', items:[
    W('catcow','warm-up',2,{reps:10,rest:15}),
    W('tilt','warm-up',2,{reps:10,rest:15}),
    W('bridge','main',3,{reps:12,rest:40,express:true}),
    W('wallraise','main',3,{reps:10,rest:35,express:true}),
    W('chinwall','main',3,{reps:10,rest:35}),
    W('sidelying','main',2,{reps:8,rest:20}),
    W('deadbug','main',3,{reps:8,rest:40}),
    W('hipflex','main',2,{secs:40,rest:20,express:true}),
    W('chest','cool-down',1,{secs:45,rest:0,express:true}),
    W('legs90','cool-down',1,{secs:240,rest:0}),
    W('wallstand','cool-down',1,{secs:60,rest:0}) ]},
  6: { title:'Mobility (optional)', focus:'Rest day or a light mobility flow', items: MOB },
  0: { title:'Mobility (optional)', focus:'Rest day or a light mobility flow', items: MOB }
};

/* ---- video lengths in seconds (shown on the thumbnails) ---- */
window.VMETA = {"v01":94,"v02":87,"v03":178,"v04":177,"v05":129,"v06":177,"v07":177,"v08":179,"v09":178,"v10":179,"v11":108,"v12":121,"v13":178,"v14":113,"v15":174,"v16":163,"v17":180,"v18":176,"v20":112,"v21":168,"v22":178,"v23":178,"v24":142,"v25":126,"v26":61,"v27":179,"v29":58,"v30":179,"v31":134,"v32":161,"v33":175,"v34":69,"v35":168};
