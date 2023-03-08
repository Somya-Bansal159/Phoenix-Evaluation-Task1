import { Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Component({
  selector: 'app-detector',
  templateUrl: './detector.component.html',
  styleUrls: ['./detector.component.css']
})
export class DetectorComponent {
  loader: OBJLoader;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  

  @ViewChild('myCanvas', {static: true}) myCanvas: ElementRef<HTMLCanvasElement>;

  constructor() {
    this.scene = new THREE.Scene();

    this.loader = new OBJLoader();
    this.loader.load( "../../assets/OBJ/Pix.obj" ,  
                      ( obj ) => { this.scene.add( obj ); } ,
                      function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); } ,
                      function ( error ) { console.error( error ); }
                    )

    // Light
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.sizes.width/this.sizes.height, 0.1, 10000);
    this.camera.position.z = 3000;
    this.camera.position.y = 1500;
    this.camera.position.x = 1500;
    this.scene.add(this.camera);
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
}
