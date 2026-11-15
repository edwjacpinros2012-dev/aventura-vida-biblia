extends Node3D

const PLAYER_SCENE: PackedScene = preload("res://scenes/player.tscn")

var wood: int = 0
var food: int = 0
var faith_points: int = 0
var hunger: int = 100
var hud_label: Label
var status_label: Label

func _ready() -> void:
	_register_inputs()
	_create_environment()
	_create_ground()
	_create_player()
	_create_resources()
	_create_hud()
	_start_survival_clock()

func _process(_delta: float) -> void:
	if Input.is_key_pressed(KEY_B):
		if not get_meta("build_key_down", false):
			set_meta("build_key_down", true)
			_try_build()
	else:
		set_meta("build_key_down", false)
	_update_hud()

func _register_inputs() -> void:
	_add_key_action("move_forward", KEY_W)
	_add_key_action("move_back", KEY_S)
	_add_key_action("move_left", KEY_A)
	_add_key_action("move_right", KEY_D)
	_add_key_action("jump", KEY_SPACE)

func _add_key_action(action_name: String, key_code: Key) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	var event := InputEventKey.new()
	event.physical_keycode = key_code
	InputMap.action_add_event(action_name, event)

func _create_environment() -> void:
	var environment := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.72, 0.82, 0.92)
	env.ambient_light_energy = 0.8
	environment.environment = env
	add_child(environment)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48, -30, 0)
	sun.light_energy = 1.25
	add_child(sun)

func _create_ground() -> void:
	var ground := StaticBody3D.new()
	ground.name = "WorldGround"
	var mesh_instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(100, 1, 100)
	mesh_instance.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.24, 0.43, 0.25)
	mesh_instance.material_override = material
	mesh_instance.position.y = -0.5
	ground.add_child(mesh_instance)

	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(100, 1, 100)
	collision.shape = shape
	collision.position.y = -0.5
	ground.add_child(collision)
	add_child(ground)

func _create_player() -> void:
	var player := PLAYER_SCENE.instantiate()
	player.name = "Player"
	player.position = Vector3(0, 0.1, 6)
	add_child(player)

func _create_resources() -> void:
	var spots: Array[Vector3] = [
		Vector3(4, 0.6, 2), Vector3(-5, 0.6, 0),
		Vector3(7, 0.6, -5), Vector3(-8, 0.6, -6),
		Vector3(1, 0.6, -10), Vector3(11, 0.6, 5)
	]
	for spot in spots:
		_create_wood_pickup(spot)

func _create_wood_pickup(at_position: Vector3) -> void:
	var pickup := Area3D.new()
	pickup.position = at_position
	pickup.add_to_group("wood_pickups")

	var mesh_instance := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = 0.35
	mesh.height = 0.7
	mesh_instance.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.55, 0.31, 0.13)
	mesh_instance.material_override = material
	pickup.add_child(mesh_instance)

	var collision := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = 1.1
	collision.shape = shape
	pickup.add_child(collision)
	pickup.body_entered.connect(_on_pickup_body_entered.bind(pickup))
	add_child(pickup)

func _on_pickup_body_entered(body: Node3D, pickup: Area3D) -> void:
	if body.name != "Player":
		return
	wood += 1
	pickup.queue_free()
	status_label.text = "¡Recurso conseguido! Madera +1"

func _try_build() -> void:
	if wood < 3:
		status_label.text = "Necesitas 3 maderas para construir una sección de muralla."
		return
	wood -= 3
	var wall := StaticBody3D.new()
	wall.name = "KingdomWall"
	var mesh_instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(3, 2.5, 0.6)
	mesh_instance.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.58, 0.56, 0.5)
	mesh_instance.material_override = material
	wall.add_child(mesh_instance)
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = mesh.size
	collision.shape = shape
	wall.add_child(collision)
	wall.position = Vector3(0, 1.25, -2)
	add_child(wall)
	status_label.text = "¡Muralla construida! Tu reino está creciendo."

func _create_hud() -> void:
	var canvas := CanvasLayer.new()
	add_child(canvas)
	var panel := PanelContainer.new()
	panel.position = Vector2(18, 18)
	panel.custom_minimum_size = Vector2(330, 120)
	canvas.add_child(panel)
	var layout := VBoxContainer.new()
	panel.add_child(layout)

	hud_label = Label.new()
	hud_label.add_theme_font_size_override("font_size", 18)
	layout.add_child(hud_label)

	status_label = Label.new()
	status_label.text = "Explora, recoge madera y construye tu primera muralla."
	status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	layout.add_child(status_label)

	var controls := Label.new()
	controls.text = "WASD: moverse · Ratón: mirar · Espacio: saltar · B: construir · ESC: liberar ratón"
	controls.position = Vector2(18, 150)
	controls.add_theme_font_size_override("font_size", 14)
	canvas.add_child(controls)

func _start_survival_clock() -> void:
	var timer := Timer.new()
	timer.wait_time = 45.0
	timer.timeout.connect(_on_survival_tick)
	add_child(timer)
	timer.start()

func _on_survival_tick() -> void:
	hunger = maxi(0, hunger - 5)
	if hunger <= 25:
		status_label.text = "Tu provisión está baja. Busca alimentos en el mundo."

func _update_hud() -> void:
	if is_instance_valid(hud_label):
		hud_label.text = "AVENTURA VIDA BIBLIA\nMadera: %d   Alimento: %d   Provisión: %d%%   Fundamentos: %d" % [wood, food, hunger, faith_points]
