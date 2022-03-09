import {Canvas, useFrame, useThree} from "@react-three/fiber";
import { FormEvent, useRef,useState } from 'react';
import * as THREE from 'three';

// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Layout from '@/components/layout/Layout';

import { computePoints } from ".";


const deg2rad = (degrees) => degrees * (Math.PI / 180);
// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
// extend({ OrbitControls });
export default function bezier3D() {
    const [points, setPoints] = useState<number[][]>([]);
    const [coord, setCoord] = useState<number[]>([]);
    const [warning, setWarning] = useState(false);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (coord[0] && coord[1] && coord[2]) {
            setPoints([...points, coord])
            setCoord([])
        }
        else {
            console.log("points")
            console.log(points);
            console.log("Coord");
            console.log(coord[0]);
            setWarning(true);
        }
    }
    return (<Layout>
        <main>
            <section className="fixed top-0 flex w-screen py-2 pl-2 text-gray-100 bg-gray-800">
                <h1 className='font-thin'>Bézier Curves 3D</h1>
            </section>
            <section className='w-screen h-screen flex flex-wrap'>
                <div className="w-[80%] h-full">
                    <Canvas>
                        <Scene points={points}/>
                    </Canvas>
                </div>
                <div className="pt-20 h-screen w-[20%] bg-gray-400">
                    <h2 className="p-5 font-thin">Add Points</h2>
                    {
                        points.map((point, index) => {
                            return <div key={index} className="w-full flex">
                                {
                                    point.map((value, index2) => {
                                        return <span key={index2} className="p-5 text-center w-1/3 bg-slate-100 hover:bg-slate-300">{value}</span>
                                    })
                                }
                            </div>
                        })
                    }
                    <span className={`text-red-600 animate-bounce ${warning? "visible":"invisible"}`}>Enter Valid Numbers Between -10 to 10</span>
                    <form className="flex w-full flex-wrap" onSubmit={(e) => handleSubmit(e)}>
                        <div className="w-full">
                            <input name="x" max="10" type="number" value={coord[0]} onChange={(e) => (parseFloat(e.target.value) ** 2 <= 100 || e.target.value === "" || e.target.value === "-") && setCoord([parseFloat(e.target.value), coord[1], coord[2]])} className="w-1/3 border-2"/>
                            <input name="y" max="10" type="number" value={coord[1]} onChange={(e) => (parseFloat(e.target.value) ** 2 <= 100 || e.target.value === "" || e.target.value === "-")  && setCoord([coord[0], parseFloat(e.target.value), coord[2]])} className="w-1/3 border-2"/>
                            <input name="z" max="10" type="number" value={coord[2]} onChange={(e) =>  (parseFloat(e.target.value) ** 2 <= 100 || e.target.value === "" || e.target.value === "-")  && setCoord([coord[0], coord[1], parseFloat(e.target.value)])} className="w-1/3 border-2"/>
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
}
function Scene({points}: SceneProps) {
     useThree(({camera}) => {
    camera.rotation.set(deg2rad(0), deg2rad(0), deg2rad(0));
  });
    return (
        <>
        <ambientLight intensity={0.3} />
        <directionalLight />
        {
            points.map((point, index) => {
                return <ControlPoint key={index} position={point} controlPoint={index === 0 || index == points.length - 1} />
            })
        }
        {
            points.map((point, index) => {
                if (index != points.length - 1 && points.length > 1) {
                    return <Line key={index} start={point} end={points[index + 1]} hull={true}/>
                }
            }) 
        }
        {
            computePoints(100, points).map((point, index, curvePoints) => {
                if (index != curvePoints.length - 1 && curvePoints.length > 1) {
                    return <Line key={index} start={point} end={curvePoints[index + 1]} hull={false}/>
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
    controlPoint: boolean,
}
function ControlPoint({position, controlPoint = false}: ControlPointProps) {
    return (
    <mesh visible position={position} >
      <sphereGeometry attach="geometry" args={[0.05, 32, 32]} />
      <meshStandardMaterial
        attach="material"
        color={controlPoint? "blue": "red"}
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
    hull: boolean
}

function Line ({start, end, hull=false}: LineProps) {
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
                <lineDashedMaterial color="white" gapSize={3} dashSize={3}/>:
                <lineBasicMaterial color="hotpink"/>

            }
        </line>
    )
}