// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import Link from "next/link";
import { FormEvent, useEffect,useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Layout from '@/components/layout/Layout';
import Seo from "@/components/Seo";

import { computePoints } from ".";


const deg2rad = (degrees: number) => degrees * (Math.PI / 180);
// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
// extend({ OrbitControls });
export default function Bezier3D() {
    const [points, setPoints] = useState<number[][]>([]);
    const [coord, setCoord] = useState<string[]>(["","",""]);
    const [change, setChange]= useState<number>(-1);
    const [warning, setWarning] = useState(false);
    const [fixedCurve, setFixedCurve] = useState<number[][]>([]);
    const [pertrube, setPertrube] = useState(false);
    const [connection, setConnection] = useState(false);
    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!isNaN(parseFloat(coord[0])) && !isNaN(parseFloat(coord[1])) && !isNaN(parseFloat(coord[2]))) {
            if (change == -1) {
                setPoints([...points, [parseFloat(coord[0]), parseFloat(coord[1]), parseFloat(coord[2])]])
            }
            else {
                const newPoints = [...points];
                newPoints[change] = [parseFloat(coord[0]), parseFloat(coord[1]), parseFloat(coord[2])];
                setPoints(newPoints);
                setChange(-1);
            }
            setCoord(["", "", ""]);
            setWarning(false);
        }
        else {
            setWarning(true);
        }
    }

    function showChanges() {
        if (pertrube) {
            setPertrube(!pertrube);
            setFixedCurve([]);
        }
        else {
            setPertrube(!pertrube);
            setFixedCurve(points.map(a => ([...a])));
        }
    }

    function remove(index: number) {
        const newPoints = [...points];
        if (index == change) {
            setChange(-1);
        }
        setPoints(newPoints.filter((point, pointIndex) => {
        if (index != pointIndex) {
            return point
        }
        }))
    }
    return (<Layout>
        <Seo templateTitle="Bezier Curves 3D"/>
        <main>
            <section className="fixed top-0 flex w-screen pl-2 text-gray-100 bg-gray-800 z-50">
                <Link href="/"><a><h1 className='font-thin py-2'>Bézier Curves 3D</h1></a></Link>
                <button className="text-slate-900 ml-20 px-5 duration-200 ease-in-out bg-slate-300 lg:px-20 hover:bg-slate-400" onClick={()=> setPoints([])}>Clear</button>
                <button className={`px-5 duration-200 ease-in-out ${connection? "bg-slate-600 hover:bg-slate-800 text-slate-100": "bg-slate-300 hover:bg-slate-400 text-slate-900"} lg:px-20`} onClick={()=> setConnection(!connection)}>{connection? "Hide Connection":"Show Connection"}</button>
                <button className={`px-5 duration-200 ease-in-out ${pertrube? "bg-slate-600 hover:bg-slate-800 text-slate-100": "bg-slate-300 hover:bg-slate-400 text-slate-900"} lg:px-20`} onClick={()=> showChanges([])}>{pertrube? "Perturb":"Modify"}</button>
            </section>
            <section className='w-screen h-screen flex flex-wrap bg-gray-900'>
                <div className="w-[80%] h-full">
                    <Canvas>
                        <Scene points={points} connection={connection}/>
                        <Scene points={fixedCurve} fixed={true}/>
                        <primitive object={new THREE.AxesHelper(100)} />
                        <CameraController/>
                    </Canvas>
                </div>
                <div className="pt-20 h-screen w-[20%] bg-gray-400 flex flex-wrap">
                    <h2 className="p-5 font-thin">Add Points</h2>
                    <div className="w-full">
                        {
                            points.map((point, index) => {
                                return <div key={index} className="w-full flex">
                                <div className="w-[90%] flex flex-wrap" onClick={() => change == index? setChange(-1) : setChange(index)}>
                                    {
                                        point.map((value, index2) => {
                                            return <span key={index2} className={`p-5 text-center w-1/3 ${change == index? "bg-blue-400 hover:bg-blue-600": "bg-slate-100 hover:bg-slate-300"}`}>{value}</span>
                                        })
                                    }
                                </div>
                                <span className="bg-red-600 align-items center w-[10%] content-center text-center hover:bg-red-800 text-slate-100" onClick={() => {remove(index)}}>x</span>
                            </div>
                            })
                        }
                    </div>
                    <span className={`text-red-600 text-center bg-red-200 justify-center animate-pulse w-full m-auto py-2 ${warning? "visible":"invisible"}`}>Enter Valid Numbers Between -10 to 10</span>
                    <span className={`text-blue-700 text-center w-full py-2 bg-teal-100 m-auto`}>{change == -1? "Adding New Points":`editing row point: ${change + 1}`}</span>
                    <form className="flex w-full flex-wrap" onSubmit={(e) => handleSubmit(e)}>
                        <div className="w-full">
                            <input name="x" max="10" type="text" value={coord[0]} onChange={(e) => setCoord([e.target.value, coord[1], coord[2]])} className="w-1/3 md:border-2"/>
                            <input name="y" max="10" type="text" value={coord[1]} onChange={(e) => setCoord([coord[0], e.target.value, coord[2]])} className="w-1/3 md:border-2"/>
                            <input name="z" max="10" type="text" value={coord[2]} onChange={(e) => setCoord([coord[0], coord[1], e.target.value])} className="w-1/3 md:border-2"/>
                        </div>
                        <button value="submit" type="submit" className="w-full p-5 bg-slate-600">Add Point</button>
                    </form>
                </div>
            </section>
        </main>
    </Layout>
    );
}
interface SceneProps {
    points: number[][];
    fixed: boolean,
    connection: boolean
}
function Scene({points, fixed=false, connection=true}: SceneProps) {

    return (
        <>
        <ambientLight intensity={0.3} />
        <directionalLight />
        {
            points.map((point, index) => {
                return <ControlPoint key={index} position={point} endPoint={index === 0 || index == points.length - 1} fixed={fixed} />
            })
        }
        {
            !fixed && connection && points.map((point, index) => {
                if (index != points.length - 1 && points.length > 1) {
                    return <Line key={index} start={point} end={points[index + 1]} hull={true} fixed={fixed}/>
                }
            }) 
        }
        {
            computePoints(100, points).map((point, index, curvePoints) => {
                if (index != curvePoints.length - 1 && curvePoints.length > 1) {
                    return <Line key={index} start={point} end={curvePoints[index + 1]} hull={false} fixed={fixed}/>
                }
            })
        }
        <ambientLight args={[0xff0000]} intensity={0.2} />
        <directionalLight position={[0, 2, 5]} intensity={1} />
        </>
        )
}

interface ControlPointProps {
    position: number[],
    endPoint: boolean,
    fixed: boolean,
}
function ControlPoint({position, endPoint = false, fixed=false}: ControlPointProps) {
    // for typescript -- no other purpose -- type check fail
    return (
    <mesh visible position={[position[0], position[1], position[2]]} >
        <sphereGeometry attach="geometry" args={[endPoint? 0.05: 0.03, 32, 32]} />
        <meshStandardMaterial
        attach="material"
        color={fixed? endPoint? "green":"yellow": endPoint? "blue": "red"}
        transparent
        roughness={0.01}
        metalness={0.01}
        />
    </mesh>
    );
}
type LineProps = {
    start: number[],
    end: number[],
    hull: boolean,
    fixed: boolean,
}

function Line ({start, end, hull=false, fixed=false}: LineProps) {
    const ref = useRef<THREE.Line>()
    
    useFrame(() => {
        if(ref.current){
            ref.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)));
        }
    })
    return (
        <line ref={ref}>
            <bufferGeometry />
            {
                hull?
                fixed? <></>:
                <lineDashedMaterial color="white" gapSize={0.01} dashSize={0.05}/>:
                <lineBasicMaterial color={fixed? "teal": "hotpink"}/>

            }
        </line>
    )
}

const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      const controls = new OrbitControls(camera, gl.domElement);

      controls.minDistance = 3;
      controls.maxDistance = 20;
      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};