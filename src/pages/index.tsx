import Layout from '@/components/layout/Layout';
import ArrowLink from '@/components/links/ArrowLink';
import ButtonLink from '@/components/links/ButtonLink';
import UnderlineLink from '@/components/links/UnderlineLink';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';
import { useState, useRef, useEffect } from 'react';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import Vercel from '~/svg/Vercel.svg';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  const [points, setPoints] = useState<number[][]>([]);
  const [fixedCurve, setFixedCurve] = useState<number[][]>([]);
  const [dragged,setDragged] = useState<number>(-1);
  const [add, setAdd] = useState(true);
  const [pertrube, setPertrube] = useState(false);
  // Orders the points in a way that maximises area for convex hull to enclose the shape created.
  const canvas = useRef<SVGSVGElement>(null);
  const convex = grahamScan(points);
  const [x, setX] = useState()
  const [y, setY] = useState()  
  useEffect(
    () => {
      if (typeof window != 'undefined') {
        const update = (e: any) => {
          setX(e.x)
          setY(e.y)
        }
        window.addEventListener('mousemove', update)
        window.addEventListener('touchmove', update)
        return () => {
          window.removeEventListener('mousemove', update)
          window.removeEventListener('touchmove', update)
        }
      }
    },
    [setX, setY]
  )
  //sets the index of the point that is being dragged
  function handleMouseDown(e: Event, index: number, fixed = false) {
    if (add) {
      setDragged(index);
    }
    else if (fixed) {
      setDragged(-2);
    }
    else {
      const newPoints= points.filter(function(value) {
          return value !== points[index];
    })
      setPoints(newPoints);
      setDragged(-2);
    }
  }
  
  function handleMouseUp() {
    newPoint();
    setDragged(-1);
  }

  function handleMouseMove(e: any) {
    if (dragged != -1) {
      const newPoints = [...points];
      if (newPoints[dragged]) {
        newPoints[dragged][0] = e.clientX;
        newPoints[dragged][1] = e.clientY;
        setPoints(newPoints);
      }
    }
  }
  
  function newPoint() {
    if (dragged == -1) {
      setPoints([...points, [x, y]])
    }
  }

  function showChanges() {
    if (pertrube) {
      setPertrube(!pertrube);
      setFixedCurve([]);
    }
    else {
      setFixedCurve(points.map(a => ([...a])));
      setPertrube(!pertrube);
    }
  }
  return (
    <Layout>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main>
        <section className='fixed top-0 flex w-screen bg-red-300'>
          <h1 className='p-5 font-serif text-center'>Bézier Curves 2D</h1>
          <button className="px-5 duration-200 ease-in-out bg-teal-300 lg:px-20 hover:bg-teal-400" onClick={()=> setPoints([])}>Clear</button>
          <button className={`lg:px-20 px-5 ${add? "bg-orange-300 hover:bg-orange-400": "bg-purple-300 hover:bg-purple-400"} ease-in-out duration-200`} onClick={()=> setAdd(!add)}>{add? "Remove": "Drag"}</button>
          <button className={`lg:px-20 px-5 ${pertrube? "bg-yellow-400 hover:bg-yellow-500": "bg-green-200 hover:bg-green-300"} ease-in-out duration-200`} onClick={()=> showChanges()}>{pertrube? "Modify": "Pertube"}</button>
        </section>
        <section className='flex w-screen bg-gray-800'>
          <svg ref={canvas} className="w-screen h-screen m-auto bg-red-100"  onMouseUp={() => {handleMouseUp()}} onMouseMove={handleMouseMove}>
              <g stroke="black" strokeWidth="3" fill="black">
                <PlotCurve scale={100} controlPoints={points} pertrube={pertrube}/>
                <PlotCurve scale={100} controlPoints={fixedCurve}/>
                  {points.length != 0 && <polyline points={`${convex.map((point) => {
                    return `${point[0]},${point[1]}`
                  })} ${convex[0][0]},${convex[0][1]}`} fill="none" stroke="rgb(255, 255, 255)" strokeDasharray="7,7" strokeWidth={2.5} />
                }
                {
                  fixedCurve.map((point, index) => {
                    if (index == 0 || fixedCurve.length - index - 1 == 0) {
                      return <EndPointCircle key={index} position={point} onMouseDown={(e: Event) => handleMouseDown(e, index, true)}/>
                    }
                    else {
                      return <ControlPointCircle key={index} position={point} onMouseDown={(e: Event) => handleMouseDown(e, index, true)}/>
                    }
                  })
                  
                }
                                  {
                  points.map((point, index) => {
                    if (index == 0 || points.length - index - 1 == 0) {
                      return <EndPointCircle key={index} position={point} onMouseDown={(e: Event) => handleMouseDown(e, index)} pertrube={pertrube}/>
                    }
                    else {
                      return <ControlPointCircle key={index} position={point} onMouseDown={(e: Event) => handleMouseDown(e, index)} pertrube={pertrube}/>
                    }
                  })
                  
                }
              </g>
          </svg>

        </section>
      </main>
    </Layout>
  );
}

function PlotCurve({scale, controlPoints, pertrube=false}: any) {
  const points = computePoints(scale, controlPoints);
  return (
    <polyline points={`${points.map((point) => {
      return `${point[0]},${point[1]} `
    })}`} stroke={pertrube? "rgb(40, 200, 10)":"rgb(100, 100, 100)"} strokeWidth={4} fill="none" />
  )
}

function EndPointCircle({position, onMouseDown, pertrube=false}: any) {
  return (
    <circle onMouseDown={onMouseDown} cx={position[0]} cy={position[1]} r={10} fill={pertrube? "rgb(10, 100, 100)": "rgb(200, 50, 50)"} stroke="none" style={{cursor:"-webkit-grab"}}/>
    )
  }
  
  function ControlPointCircle({position, onMouseDown, pertrube=false}: any) {
    return (
    <circle onMouseDown={onMouseDown} cx={position[0]} cy={position[1]} r={8} fill={pertrube? "rgb(100, 20, 60)" :"rgb(50, 50, 50)"} stroke="rgb(255, 255, 255)" strokeWidth={3} style={{cursor:"-webkit-grab"}}/>
  )
}
interface pair {
  p1: number[]
  p2: number[]
}

function computePoints(scale: number, points: number[][]): number[][] {
  const values: number[][] = [];
  for (let i = 0; i <= scale; i++) {
    values.push(curveFunction(points, i/scale));
  }
  return values;
}
const factorial_lookup: { [name: number]: number } = {}

function factorial(n: number): number {
  if (n < 2) {
    return 1
  }
  if(factorial_lookup[n]){
    return factorial_lookup[n]
  }
  else {
    factorial_lookup[n] = n * factorial(n - 1);
    return factorial_lookup[n]
  }
}

const choose_lookup: {[name: string]: number} = {}

function choose(n: number , r: number) {
  const lookup = `${n},${r}`;
  const r_lookup = `${n},${n - r}`;
  if (choose_lookup[lookup]) {
    return choose_lookup[lookup];
  }
  else if (choose_lookup[r_lookup]) {
    return choose_lookup[r_lookup];
  }
  else {
    choose_lookup[lookup] = factorial(n) / (factorial(n - r) * factorial(r))
    return choose_lookup[lookup];
  }
}

function curveFunction(p: number[][], u: number): number[] {
  const value: number[] = [0, 0];
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < p[i].length; j++){
      value[j] += choose(p.length - 1, i) * u ** i * (1 - u) ** (p.length - 1 - i) * p[i][j];
    }
  }
  return value
}

function grahamScan(points_array: number[][]) {
  // Deep copy of the array is required so that this operations on the array do not effect the points program wide
  const points = points_array.map(a => ([...a]));
  if (points.length > 3) {
    const stack:number[][] = [];
    // Find the leftmost points
    // essetially finding min algorithm O(n)
    let leftmost = points[0];
    for (let i = 1; i < points.length; i++) {
      if (leftmost[1] > points[i][1] || (points[i][1] == leftmost[1] &&  leftmost[0] > points[i][0])) {
        leftmost = points[i];
      }
    }

    // Conversion to polar coordinates
    // O(n)
    for (let i = 0; i < points.length; i++) {
      // calcualtes angle give y and x coordinate in degrees
      points[i][2] = Math.atan2(points[i][1] - leftmost[1], points[i][0] - leftmost[0]); 
    }

    //sorting by polar angle could be O(n) with merge sort
    points.sort((a, b)=> {
      return a[2] === b[2]? a[0] - b[0]: a[2] - b[2];
    })

    // adding left turns
    for (let i = 0; i < points.length; i++) {
      // removes points which require clockwise turn
      while (stack.length > 1 && ccw(points[i], stack[stack.length -  2], stack[stack.length - 1]) > 0) {
        stack.pop();
      }
      stack.push(points[i]);
    }
 
    // Removes the angle
    return stack
  }

  else {
    return points;
  }
}


// determines is a set of angles move counter clockwise
function ccw(point: number[], a: number[], b: number[]) {
  return (b[1] - a[1]) * (point[0] - b[0]) - (point[1] - b[1]) * (b[0] - a[0]);
}