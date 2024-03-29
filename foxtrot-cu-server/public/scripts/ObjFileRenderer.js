ObjFileRenderer = function(screen_width, screen_height, domElement) {
    // Will render the provided objData in a canvas of the specified dimensions added as a child of domElement
    var camera, scene, pickingScene, renderer, stats, controls;

    var model_renderer;
    var loader = new THREE.OBJLoader();
    var selectBox;

    var center, half_extents;

    var select_box_material = new THREE.MeshBasicMaterial({
        color: 0xFFE135,
        wireframe: true
    });

    var selectBoxDim = 1.02;
    var selectBoxHalfDim = selectBoxDim / 2.0;
    var scale = 0.5;

    var gridXZ = null;

    var active = true;

    init();
    animate();

    function init() {
        camera = new THREE.PerspectiveCamera(70, screen_width / screen_height, 0.1, 1000000);
        camera.position.set(10, 10, 10);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        pickingScene = new THREE.Scene();

        scene = new THREE.Scene();

        scene.add(new THREE.AmbientLight(0x555555));

        var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
        light.position.set(1500,2000,1500);
        light.target.position.set(0,0,0);
        scene.add(light);

        var light2 = new THREE.DirectionalLight( 0xffffff, 0.2 );
        light2.position.set(-1500,-2000,-1500);
        light2.target.position.set(0,0,0);
        scene.add(light2);


        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(screen_width, screen_height);
        renderer.sortObjects = false;

        domElement.appendChild(renderer.domElement);

        var selectBoxGeom = new THREE.BoxGeometry(selectBoxDim, selectBoxDim, selectBoxDim);

        selectBox = new THREE.BoxHelper(new THREE.Mesh( selectBoxGeom, select_box_material));
        selectBox.visible = false;
        scene.add(selectBox);



        //stats = new Stats();
        //stats.domElement.style.position = 'absolute';
        //stats.domElement.style.top = '0px';

        //domElement.appendChild(stats.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.mouseButtons = {
            ORBIT: THREE.MOUSE.MIDDLE,
            ZOOM: -1,
            PAN: THREE.MOUSE.RIGHT
        };
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.enableKeys = false;
        controls.zoomSpeed = 3.0;

    }

    function animate() {
        requestAnimationFrame(animate);

        if (!active)
            return;

        renderer.render(scene, camera);

        controls.update();

        //stats.update();

    }

    this.setActive = function(active_) {
        active = active_;
    }

    this.setObjData = function(objData) {
        if (typeof model_renderer !== 'undefined')
            scene.remove(model_renderer)

        selectBox.visible = false;
        var bounds = {min: new THREE.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), max: new THREE.Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE)};
        model_renderer = loader.parse(objData, bounds);

        center = new THREE.Vector3((bounds.min.x + bounds.max.x) / 2.0, (bounds.min.y + bounds.max.y) / 2.0, (bounds.min.z + bounds.max.z) / 2.0);
        half_extents = new THREE.Vector3((bounds.max.x - bounds.min.x) / 2.0, (bounds.max.y - bounds.min.y) / 2.0, (bounds.max.z - bounds.min.z) / 2.0);

        var radius = half_extents.length() + 10.0;

        model_renderer.position.set(-center.x, -center.y, -center.z);

        controls.position0.set(radius, radius, radius);
        controls.target0.set(0,0,0);
        controls.reset();

        scene.add(model_renderer)
    }


    this.setScale = function(scale_) {
        scale = scale_;
    }


    this.setHighlightBlockPosition = function(x,y,z) {
        selectBox.visible = true;
        selectBox.position.set(x+selectBoxHalfDim*scale-center.x,y+selectBoxHalfDim*scale-center.y,z+selectBoxHalfDim*scale-center.z);
        selectBox.scale.set(scale, scale, scale);
    }

    this.setGrid = function(centerOfMass, offset, blockListDimensions) {
        if (gridXZ != null)
            scene.remove(gridXZ);

        var maxX = blockListDimensions.x;
        var maxZ = blockListDimensions.z;

        var centerX = Math.floor(maxX/2);
        var centerZ = Math.floor(maxZ/2);

        var convertedX = centerOfMass.x + (centerX-offset.x)*scale;
        var convertedY = centerOfMass.y + (-offset.y)*scale;
        var convertedZ = centerOfMass.z + (centerZ-offset.z)*scale;

        var gridScale = Math.ceil(scale);
        var gridsize = Math.ceil(Math.max(maxX, maxZ) / 2);

        gridXZ = new THREE.GridHelper(gridsize,1);
        gridXZ.scale.set(gridScale, gridScale, gridScale);
        gridXZ.position.set(convertedX-center.x, convertedY-center.y, convertedZ-center.z);
        scene.add(gridXZ);
    }



}
