compareCells = (c1, c2) ->
  return c1.length is c2.length and c1.every (elem, i) -> elem is c2[i]
    
class Snake
  constructor: (x, y) ->
    @direction = [0, 1]
    @next_direction = [0, 1]
    @body = [[x, y]]
    @color = '#435678'
    @dead = false
    
  isGoodDirection: () ->
    return (@direction[0] + @next_direction[0]) != 0 or 
           (@direction[1] + @next_direction[1]) != 0
    
  move: (pos, direction) ->
    @body.unshift(pos)
    @body.pop()
    
    @direction = direction
    
  isInBody: (x, y) ->
    for cell in @body
      return true if x == cell[0] and y == cell[1]
    return false
  
  nextCell: () ->
    d = if @isGoodDirection() then @next_direction else @direction
      
    return [@body[0][0] + d[0], @body[0][1] + d[1]]

class Field
  constructor: (@width, @height) ->
    @food = []
    @snakes = []
    
  foodIndex: (x, y) ->
    for f, i in @food
      return i if x == f[0] and y == f[1]
    return -1
  
  normalizeCell: (cell) ->
    return [(cell[0] + @width) % @width , (cell[1] + @height) % @height]
  
class HTMLGraphics
  constructor: (@field) ->
    @cells = []
    for c in [0..@field.height-1]
      @cells.push []
      
    @createField()
    
    
  createField: ->

    for row in [0..@field.height-1]
      new_row = document.createElement "tr"
      
      for cols in [0..@field.width-1]
        new_cell = document.createElement "td"
        @cells[row].push new_cell
        new_row.appendChild new_cell
        
      field.appendChild new_row
      
    
  beginDraw: ->
    for row in @cells
      for cell in row
        cell.className = ""
        
  drawSnake: (snake) ->
    for cell in snake.body
      @cells[cell[1]][cell[0]].className = snake.color
    cell = snake.body[0]
    @cells[cell[1]][cell[0]].className = snake.color + "head"
    
  drawFood: (food) ->
    food_class = "food"
    
    for f in food
      @cells[f[1]][f[0]].className = food_class
  
class Graphics
  constructor: (@field) ->
    @context = canvas.getContext('2d')
    
  beginDraw: ->
    @context.fillStyle = '#00ff00'
    @context.fillRect(0, 0, @canvas.width, @canvas.height)
    
    cellSizeX = @canvas.width / @field.width
    cellSizeY = @canvas.height / @field.height
    
    @cellSize  = Math.min cellSizeX , cellSizeY
    
    @offsetX = (@canvas.width - @cellSize * @field.width) / 2
    @offsetY = (@canvas.height - @cellSize * @field.height) / 2
       
  drawCell: (x, y) ->
    @context.fillRect @offsetX + x * @cellSize, 
                      @offsetY + y * @cellSize, 
                      @cellSize, @cellSize
        
  drawSnake: (snake) ->
    @context.fillStyle = snake.color
    
    for cell in snake.body 
      @drawCell(cell[0], cell[1])
      
  drawFood: (food) ->
    @context.fillStyle = '#ff0000'
    
    for f in food
      @drawCell(f[0], f[1])

class Game
  constructor: (@width, @height) ->
    @field = new Field @width, @height
    @graphics = new HTMLGraphics @field
    
    snake1 = new Snake 0, 0
    # snake1.color = '#ff00ff'
    snake1.color = 'snake1'
    snake2 = new Snake @width - 1, @height - 1
    #snake2.color = '#ffff00'
    snake2.color = 'snake2'
    snake2.direction = [0, -1]
    
    @field.snakes.push snake1
    @field.snakes.push snake2
    #@user1 = new KeyboardController @canvas, snake1
    #@user2 = new KeyboardController2 @canvas, snake2
    @ai1 = new AIController @field, snake1
    @ai2 = new AIController2 @field, snake2
    @current_snake = 0
    
  draw: ->
    @graphics.beginDraw()
    
    for snake in @field.snakes
      @graphics.drawSnake snake
     
    @graphics.drawFood(@field.food)
      
  update: ->
    @updateFood()
    
    @current_snake %= @field.snakes.length
    
    @updateSnake @field.snakes[@current_snake++]
      
    @ai1.update()
    @ai2.update()
  
  updateSnake: (snake) ->
    #return if snake.dead
    
    snake.dead = false
    next_cell = @field.normalizeCell snake.nextCell()
    food_index =  @field.foodIndex next_cell[0], next_cell[1]
    if food_index >= 0
      snake.body.unshift(next_cell)
      @field.food.splice(food_index, 1)
      snake.direction = snake.next_direction if snake.isGoodDirection()
    else
      for s in @field.snakes when s isnt snake
        snake.dead |= s.isInBody(next_cell[0], next_cell[1])
      snake.dead |= snake.isInBody(next_cell[0], next_cell[1]) and !compareCells snake.body[snake.body.length - 1], next_cell
        
      if !snake.dead 
        direction = if snake.isGoodDirection() then snake.next_direction else snake.direction
        snake.move next_cell, direction
      else
        @trimTail snake
  
  
  trimTail: (snake) ->
    return if snake.body.length <= 1
    
    @field.food.push snake.body.pop()
  
  updateFood: () ->
    count = 3 - @field.food.length
    
    while count > 0
      
      x = Math.floor Math.random() * @field.width
      y = Math.floor Math.random() * @field.height
      
      in_snake = false
      for snake in @field.snakes
        if snake.isInBody(x, y)
          in_snake = true
          break
      
      if !in_snake
        @field.food.push [x, y]
        --count
     
    
    
  class KeyboardController
    constructor: (@canvas, snake) ->
      
      keydown = (e) ->
        e = e || window.event;
      
        snake.next_direction = [ 0,-1] if e.keyCode == 38
        snake.next_direction = [ 0, 1] if e.keyCode == 40
        snake.next_direction = [ 1, 0] if e.keyCode == 39
        snake.next_direction = [-1, 0] if e.keyCode == 37
      
      #@canvas.onkeydown = keydown
      @canvas.addEventListener('keydown', keydown, false)
      
  class KeyboardController2
    constructor: (@canvas, snake) ->
      
      keydown = (e) ->
        e = e || window.event;
      
        snake.next_direction = [ 0,-1] if e.keyCode == 87
        snake.next_direction = [ 0, 1] if e.keyCode == 83
        snake.next_direction = [ 1, 0] if e.keyCode == 68
        snake.next_direction = [-1, 0] if e.keyCode == 65
      
      #@canvas.onkeydown = keydown
      @canvas.addEventListener('keydown', keydown, false)
      
  class AIController
    constructor: (@field, @snake) ->
    
    distance: (cell1, cell2) ->
      absx = Math.abs cell1[0] - cell2[0]
      absy = Math.abs cell1[1] - cell2[1]
      
      x = Math.min absx, @field.width - absx
      y = Math.min absy, @field.height - absy
      
      return x + y
    
    inCollision: (cell) ->
      in_collision = false
      
      for s in @field.snakes when s isnt @snake
        in_collision |= s.isInBody(cell[0], cell[1])
        
      in_collision |= @snake.isInBody(cell[0], cell[1]) and !compareCells @snake.body[@snake.body.length - 1], cell
      
      return in_collision
    
    
    update: () ->
      distances = []
      
      return if @field.food.length == 0
      
      for f in @field.food
        distances.push @distance(@snake.body[0], f)
      
      min_distance = Math.min.apply(Math, distances)
      target = @field.food[distances.indexOf min_distance]
      
      next_cell = @field.normalizeCell @snake.nextCell()
      
      return if @distance(next_cell, target) < min_distance and !@inCollision next_cell
      
      possible_directions = []
      distances = []
      
      for direction in [ [0, -1], [0, 1], [-1, 0], [1, 0] ]
        @snake.next_direction = direction
        continue if !@snake.isGoodDirection()
        next_cell = @field.normalizeCell @snake.nextCell()
        if !@inCollision next_cell
          possible_directions.push direction
          distances.push @distance(next_cell, target)
        
      
      return if distances.length < 1
      
      min_distance = Math.min.apply(Math, distances)
      @snake.next_direction = possible_directions[distances.indexOf(min_distance)]
      
      
  class AIController2
    constructor: (@field, @snake) ->
      @astar = new AStar @field
      
    update: () ->
      distances = []
      directions = []
      
      return if @field.food.length == 0
      
      for f in @field.food
        d = @astar.search(@snake.body[0], f)
        continue if d == null
        distances.push d[1]
        directions.push d[0]
        #break
          
      return if distances.length < 1
          
      min_distance = Math.min.apply(Math, distances)
      @snake.next_direction = directions[distances.indexOf(min_distance)]      
      
      
class AStar
  
  class Cell
    constructor: (@pos) ->
      @init()
      
    init: () ->
      @g = 0
      @h = 0
      @cost = @g + @h
      @parent_cell = null
      @snake = false
      @visited = false
      @cached = false
      
    setCost: (@h, @parent_cell = null) ->     
      @g = if @parent_cell != null then @parent_cell.g + 1 else 0
      @cost = @h + @g
        
        
  
  constructor: (@field) ->
    @search_field = []
    for i in [0..@field.width]
      @search_field.push new Array(@field.height)
      
    for x in [0..@field.width]
      for y in [0..@field.height]
        @search_field[x][y] = new Cell [x, y]
     
    @cost_map = new Array(@field.height * @field.width)
    for i in [0..@field.width * @field.height]
      @cost_map[i] = []
      
    @cost_cache = 0
    @count = 0
  
  costMapAdd: (cell) ->
    cell.cached = true
    @cost_map[cell.cost].push cell
    
    @cost_cache = cell.cost if cell.cost < @cost_cache
      
  costMapGet: () ->
    ++@count
    while @cost_cache < @cost_map.length
      return @cost_map[@cost_cache].pop() if @cost_map[@cost_cache].length > 0
      ++@cost_cache
      
    return null
      
  distance: (cell1, cell2) ->
      absx = Math.abs cell1[0] - cell2[0]
      absy = Math.abs cell1[1] - cell2[1]
      
      x = Math.min absx, @field.width - absx
      y = Math.min absy, @field.height - absy
      
      return x + y
    
  refresh: () ->
    for x in [0..@field.width]
      for y in [0..@field.height]
        @search_field[x][y].init()
        
    for snake in @field.snakes
      for cell in snake.body
        @search_field[cell[0]][cell[1]].cached = true
        
    for i in [0..@field.width * @field.height]
      @cost_map[i].length = 0
      
    @count = 0
      
  search: (start, target) ->
    @refresh()
    
    cell = @search_field[start[0]][start[1]]
    cell.setCost @distance(start, target)
    
    @costMapAdd(cell)
    
    while (cell = @costMapGet()) != null
      cell.visited = true
      
      break if compareCells cell.pos, target
      
      neighbor_x = cell.pos[0]
      neighbor_y = (cell.pos[1] + 1) % @field.height
      neighbor = @search_field[neighbor_x][neighbor_y]
      
      if !neighbor.cached
        neighbor.setCost @distance(neighbor.pos, target), cell
        @costMapAdd neighbor
        
      neighbor_x = cell.pos[0]
      neighbor_y = (cell.pos[1] - 1 + @field.height) % @field.height
      neighbor = @search_field[neighbor_x][neighbor_y]
      
      if !neighbor.cached
        neighbor.setCost @distance(neighbor.pos, target), cell
        @costMapAdd neighbor
        
      neighbor_x = (cell.pos[0] + 1) % @field.width
      neighbor_y = cell.pos[1]
      neighbor = @search_field[neighbor_x][neighbor_y]
      
      if !neighbor.cached
        neighbor.setCost @distance(neighbor.pos, target), cell
        @costMapAdd neighbor
        
      neighbor_x = (cell.pos[0] - 1 + @field.width) % @field.width
      neighbor_y = cell.pos[1]
      neighbor = @search_field[neighbor_x][neighbor_y]
      
      if !neighbor.cached
        neighbor.setCost @distance(neighbor.pos, target), cell
        @costMapAdd neighbor
        
    return null if cell == null
    
    target_g = cell.g
    
    while cell.parent_cell.g != 0
      cell = cell.parent_cell
      
    direction = [cell.pos[0] - start[0], cell.pos[1] - start[1]]
    
    direction[0] += @field.width if direction[0] < -1
    direction[0] -= @field.width if direction[0] >  1
    direction[1] += @field.height if direction[1] < -1
    direction[1] -= @field.height if direction[1] >  1
    #console.log(@count)
    return [direction, target_g]
        
    
game = new Game 20, 20
game.draw()

i = 10000

clock = () ->
  return if --i < 0
  
  setTimeout(clock, 100)
  game.update()
  game.draw()
  
clock()
