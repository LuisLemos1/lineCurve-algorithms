export {bezier3};
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';

function bezier3(c0, c1, c2, c3, t) {

  if(t < 0 || t > 1)
    return undefined;
  
  c0.x *= Math.pow(1-t, 3);
  c0.y *= Math.pow(1-t, 3);
  c0.z *= Math.pow(1-t, 3);

  c1.x *= 3 * t * Math.pow(1-t, 2);
  c1.y *= 3 * t * Math.pow(1-t, 2);
  c1.z *= 3 * t * Math.pow(1-t, 2);

  c2.x *= 3 * (1 - t) * Math.pow(t, 2);
  c2.y *= 3 * (1 - t) * Math.pow(t, 2);
  c2.z *= 3 * (1 - t) * Math.pow(t, 2);

  c3.x *= Math.pow(t, 3);
  c3.y *= Math.pow(t, 3);
  c3.z *= Math.pow(t, 3);

  return new THREE.Vector3( c0.x + c1.x + c2.x + c3.x, 
                            c0.y + c1.y + c2.y + c3.y,
                            c0.z + c1.z + c2.z + c3.z );
}