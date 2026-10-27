"""Original, deterministic office asset. Run: blender -b --python scripts/build-office.py.
No downloads, external assets, add-ons, network calls, or user-project modifications.
Blender GPL applies to the tool, not automatically to original geometry exported by this script."""
import bpy, math, json, pathlib, sys
from mathutils import Vector
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/models/office.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
def material(name, color, rough=.65, metallic=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metallic
    return m
wood=material('Warm oak',(0.53,.34,.19)); green=material('Sage wall',(.32,.47,.41)); white=material('Warm white',(.91,.90,.83)); dark=material('Graphite',(.06,.10,.12)); blue=material('Soft blue',(.20,.37,.49)); skin=material('Skin',(.61,.36,.23)); floor=material('Stone floor',(.70,.70,.64)); leaf=material('Plant',(.15,.34,.21)); orange=material('Terracotta',(.60,.28,.16)); glass=material('Screen',(.12,.25,.31),.3); ink=material('Ink',(.15,.27,.23))
def cube(name, loc, scale, mat, term=None, bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel: m=o.modifiers.new('Soft edges','BEVEL');m.width=bevel;m.segments=2; o.modifiers.new('Normals','WEIGHTED_NORMAL')
    o.data.materials.append(mat)
    if term:o['term']=term
    return o
def sphere(name, loc, scale, mat, term=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=loc);o=bpy.context.object;o.name=name;o.scale=scale; o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    if term:o['term']=term
    return o
def cylinder(name, loc, radius, depth, mat, term=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=radius,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    if term:o['term']=term
    return o
# Open cutaway room: floor and two walls, daylight windows and original geometry only.
cube('Room floor',(0,0,-.1),(8,6,.18),floor)
cube('Back wall',(0,2.95,1.7),(8,.15,3.4),white)
cube('Side wall',(-3.95,0,1.7),(.15,6,3.4),green)
cube('Window daylight',(-3.84,.5,2),(.025,3,1.6),glass)
for y in [-1,.5,2]:cube('Window frame',(-3.80,y,2),(.08,.045,1.7),white)
cube('Window sill',(-3.7,.5,1.16),(.45,3.25,.1),wood)
# Main desk with laptop, notebook, pen and cup.
cube('Desk',(0,-.5,.82),(2.8,1.3,.13),wood,'desk')
for x in [-1.22,1.22]:
 for y in [-1.02,.02]:cube('Desk leg',(x,y,.39),(.085,.085,.8),dark,'desk')
cube('Laptop base',(-.35,-.4,.925),(.85,.60,.04),dark,'laptop')
screen=cube('Laptop screen',(-.35,-.08,1.20),(.85,.055,.55),glass,'laptop');screen.rotation_euler.x=math.radians(-12)
for z in [1.12,1.20,1.28]:cube('Screen line',(-.38,-.122,z),(.50,.006,.015),white,'laptop',.004)
cube('Notebook',(.64,-.59,.935),(.43,.56,.055),blue,'notebook');cube('Notebook pages',(.65,-.59,.962),(.39,.51,.01),white,'notebook',.008)
for y in [-.76,-.66,-.56]:cube('Notebook ruled page',(.68,y,.970),(.28,.009,.004),ink,'notebook',0)
cylinder('Mug',(-1,-.38,1.02),.10,.23,white);cube('Pen',(.97,-.7,.94),(.03,.35,.03),dark,'notebook',.006)
# Chair, task lighting and storage.
cube('Chair seat',(.05,-1.58,.48),(.72,.66,.12),green)
cube('Chair back',(.05,-1.89,.92),(.72,.13,.85),green)
cylinder('Chair stem',(.05,-1.58,.24),.065,.40,dark)
for a in range(5):
 angle=a*math.tau/5
 leg=cube('Chair base',(.05+math.cos(angle)*.19,-1.58+math.sin(angle)*.19,.08),(.52,.045,.04),dark);leg.rotation_euler.z=angle
cube('Cabinet',(-2.5,2.40,.60),(1.6,.68,1.20),wood)
for z in [.32,.76]:cube('Cabinet handle',(-2.5,2.025,z),(.4,.03,.035),dark)
# Whiteboard with physically separate marker lines.
cube('Whiteboard frame',(.5,2.83,2.02),(2.7,.09,1.45),dark,'whiteboard')
cube('Whiteboard',(.5,2.77,2.02),(2.58,.025,1.32),white,'whiteboard')
for z in [2.4,2.17,1.94]:
 cube('Plan line',(.14,2.74,z),(1.5,.015,.035),ink,'whiteboard',.008)
 cube('Plan bullet',(-.81,2.73,z),(.07,.015,.07),orange,'whiteboard',.008)
cube('Whiteboard tray',(.5,2.60,1.31),(2.6,.25,.06),dark,'whiteboard')
# Calendar with a month grid. No third-party typography/textures.
cube('Calendar', (2.6,2.77,2.18),(1,.06,.85),white,'calendar')
cube('Calendar header',(2.6,2.725,2.49),(1,.012,.20),blue,'calendar',.005)
for x in range(5):
 for z in range(3):cube('Calendar date',(2.23+x*.18,2.724,1.94+z*.16),(.025,.01,.025),dark,'calendar',0)
# Stylised original coworker: articulated hand gesture and head movement.
root=bpy.data.objects.new('Coworker',None);bpy.context.collection.objects.link(root);root.location=(2.7,.55,0);root['term']='coworker'
def part(obj): obj.parent=root; return obj
part(cube('Coworker torso',(0,0,1.2),(.45,.29,.62),blue,'coworker',.13))
part(sphere('Coworker head',(0,0,1.79),(.20,.19,.25),skin,'coworker'))
part(sphere('Coworker hair',(0,.02,1.95),(.203,.184,.13),dark,'coworker'))
for x in [-.13,.13]:
 part(cube('Coworker leg',(x,0,.49),(.15,.19,.87),dark,'coworker',.04));part(cube('Coworker shoe',(x,-.05,.075),(.19,.34,.12),dark,'coworker'))
part(cube('Coworker left arm',(-.32,0,1.20),(.14,.18,.56),blue,'coworker',.06))
arm=bpy.data.objects.new('Greeting arm',None);bpy.context.collection.objects.link(arm);arm.parent=root;arm.location=(.26,0,1.47);arm['term']='coworker'
for ob in [cube('Sleeve',(.16,0,0),(.40,.16,.16),blue,'coworker',.07),sphere('Hand',(.41,0,.05),(.11,.09,.12),skin,'coworker')]:ob.parent=arm
for frame,angle in [(1,20),(18,48),(32,25),(46,48),(60,20)]:
 arm.rotation_euler.y=math.radians(-angle);arm.keyframe_insert(data_path='rotation_euler',frame=frame)
arm.animation_data.action.name='Coworker greeting'
# Plant and ceiling lighting.
cylinder('Plant pot',(-2.6,-1.55,.23),.26,.45,orange)
for i in range(8):
 a=i*math.tau/8;sphere('Leaf',(-2.6+math.cos(a)*.16,-1.55+math.sin(a)*.16,.65+i*.08),(.13,.08,.32),leaf)
bpy.context.scene.frame_end=60;bpy.context.scene.render.fps=24;bpy.context.scene.frame_set(1)
# Render camera optional, export has no dependent external files.
bpy.ops.object.camera_add(location=(9,-12,9));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=11;bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(1,-2,7));bpy.context.object.data.energy=1200;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=8
scene=bpy.context.scene;scene.world=bpy.data.worlds.new('Office world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.8,.85,.9,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
OUT.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(OUT),export_format='GLB',export_apply=True,export_extras=True,export_animations=True,export_cameras=False,export_lights=False)
# Small web production budget and semantic/animation checks on the actual exported artifact.
import struct
blob=OUT.read_bytes();assert blob[:4]==b'glTF';length,kind=struct.unpack_from('<II',blob,12);meta=json.loads(blob[20:20+length]);terms={n.get('extras',{}).get('term') for n in meta['nodes']};assert {'desk','laptop','notebook','whiteboard','calendar','coworker'} <= terms;assert meta.get('animations');assert len(blob)<2_000_000
summary={'blender':bpy.app.version_string,'bytes':len(blob),'nodes':len(meta['nodes']),'meshes':len(meta['meshes']),'animations':len(meta['animations']),'terms':sorted(t for t in terms if t),'source':'scripts/build-office.py'}
(ROOT/'public/models/office-manifest.json').write_text('{\n'+',\n'.join('  '+json.dumps(k)+': '+json.dumps(v) for k,v in summary.items())+'\n}\n')
print('OFFICE_ASSET_VALIDATED',json.dumps(summary))
if '--render' in sys.argv:
 scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=False;scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.filepath='/tmp/office-preview.png';bpy.ops.render.render(write_still=True)
