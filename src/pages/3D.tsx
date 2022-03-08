import {Canvas, useFrame} from "@react-three/fiber";
import { useRef,useState } from 'react';

import Layout from '@/components/layout/Layout';

export default function bezier3D() {
    const [points, setPoints] = useState<number[][]>([]);
    return (<Layout>
        <main>
            <section className="fixed top-0 flex w-screen py-2 pl-2 text-gray-100 bg-gray-800">
                <h1 className='font-thin'>Bézier Curves 3D</h1>
            </section>
            <section className='w-screen h-screen'>
                <Canvas>
                          <ambientLight intensity={0.2} />
                    <directionalLight />
        `           <Line start={[0,0,0]} end={[1,1,0]} />
                    <Line start={[1,1,0]} end={[2,0,0]} />
                    <mesh>
                    <boxBufferGeometry />
                    <meshPhongMaterial />
                    </mesh>
                    <ambientLight args={[0xff0000]} intensity={0.1} />
                    <directionalLight position={[0, 2, 5]} intensity={0.5} />
                </Canvas>
            </section>
        </main>
    </Layout>
    );
}

type props = {
    start: number[],
    end: number[]
}

function Line (props: props) {
    const ref = useRef<THREE.Line>()

    useFrame(() => {
        if(ref.current){
            ref.current.geometry.setFromPoints([props.start, props.end].map((point) => new THREE.Vector3(...point)));
        }
    })
    return (
        <line ref={ref}>
            <bufferGeometry />
            <lineBasicMaterial color="hotpink"/>
        </line>
    )
}

function PolyLine() {

    return (
        <></>
    )
}