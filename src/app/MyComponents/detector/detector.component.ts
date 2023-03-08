import { Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass, EffectComposer, OutlinePass } from "three-outlinepass"

@Component({
  selector: 'app-detector',
  templateUrl: './detector.component.html',
  styleUrls: ['./detector.component.css']
})
export class DetectorComponent {
  loader: GLTFLoader;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  pointer = new THREE.Vector2(1,1);
  raycaster = new THREE.Raycaster();
  

  @ViewChild('myCanvas', {static: true}) myCanvas: ElementRef<HTMLCanvasElement>;

  constructor() {
    // Scene
    this.scene = new THREE.Scene();

    // Load gltf
    this.loader = new GLTFLoader();
    this.loader.load( "../../assets/models/cms.gltf" ,  
                      ( gltf ) => { this.scene.add ( gltf.scene ) ; } ,
                      ( xhr ) => { console.log ( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) ; },
                      ( error ) => { console.error ( error ) ; }
                    );

    // Light
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.sizes.width/this.sizes.height);
    this.camera.position.z = 30;
    this.scene.add(this.camera);

    window.addEventListener( 'click', (event) => {
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.setFromCamera( this.pointer, this.camera );
      const intersects = this.raycaster.intersectObjects( this.scene.children );
      if(intersects.length > 0)
          this.outline(intersects[0]);
    } );

  }

  ngAfterViewInit() {
    // Canvas
    const canvas = this.myCanvas.nativeElement;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.render(this.scene, this.camera);

    const controls = new OrbitControls(this.camera, canvas);

    const loop = () => {
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(loop);
    }

    loop();
  }

  outline(intersect) {
    const selectedObjects = [intersect.object];

    const compose = new EffectComposer(this.renderer);
    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera, selectedObjects);

    outlinePass.renderToScreen = true;
    outlinePass.selectedObjects = selectedObjects;

    compose.addPass(new RenderPass(this.scene, this.camera));
    compose.addPass(outlinePass);

    outlinePass.edgeStrength = 4;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0xffffff);

    const loop = () => {
      compose.render(this.scene, this.camera);
      window.requestAnimationFrame(loop);
    }

    loop();
  }
}
