// Generated by CoffeeScript 1.7.1
(function() {
  var AStar, Field, Game, Graphics, Snake, clock, compareCells, context, game, height, i, width;

  width = canvas.width;

  height = canvas.height;

  context = canvas.getContext('2d');

  context.fillStyle = '#00ff00';

  context.fillRect(0, 0, width, height);

  compareCells = function(c1, c2) {
    return c1.length === c2.length && c1.every(function(elem, i) {
      return elem === c2[i];
    });
  };

  Snake = (function() {
    function Snake(x, y) {
      this.direction = [0, 1];
      this.next_direction = [0, 1];
      this.body = [[x, y]];
      this.color = '#435678';
      this.dead = false;
    }

    Snake.prototype.isGoodDirection = function() {
      return (this.direction[0] + this.next_direction[0]) !== 0 || (this.direction[1] + this.next_direction[1]) !== 0;
    };

    Snake.prototype.move = function(pos, direction) {
      this.body.unshift(pos);
      this.body.pop();
      return this.direction = direction;
    };

    Snake.prototype.isInBody = function(x, y) {
      var cell, _i, _len, _ref;
      _ref = this.body;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (x === cell[0] && y === cell[1]) {
          return true;
        }
      }
      return false;
    };

    Snake.prototype.nextCell = function() {
      var d;
      d = this.isGoodDirection() ? this.next_direction : this.direction;
      return [this.body[0][0] + d[0], this.body[0][1] + d[1]];
    };

    return Snake;

  })();

  Field = (function() {
    function Field(width, height) {
      this.width = width;
      this.height = height;
      this.food = [];
      this.snakes = [];
    }

    Field.prototype.foodIndex = function(x, y) {
      var f, i, _i, _len, _ref;
      _ref = this.food;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        f = _ref[i];
        if (x === f[0] && y === f[1]) {
          return i;
        }
      }
      return -1;
    };

    Field.prototype.normalizeCell = function(cell) {
      return [(cell[0] + this.width) % this.width, (cell[1] + this.height) % this.height];
    };

    return Field;

  })();

  Graphics = (function() {
    function Graphics(canvas, field) {
      this.canvas = canvas;
      this.field = field;
      this.context = this.canvas.getContext('2d');
    }

    Graphics.prototype.beginDraw = function() {
      var cellSizeX, cellSizeY;
      this.context.fillStyle = '#00ff00';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      cellSizeX = this.canvas.width / this.field.width;
      cellSizeY = this.canvas.height / this.field.height;
      this.cellSize = Math.min(cellSizeX, cellSizeY);
      this.offsetX = (this.canvas.width - this.cellSize * this.field.width) / 2;
      return this.offsetY = (this.canvas.height - this.cellSize * this.field.height) / 2;
    };

    Graphics.prototype.drawCell = function(x, y) {
      return this.context.fillRect(this.offsetX + x * this.cellSize, this.offsetY + y * this.cellSize, this.cellSize, this.cellSize);
    };

    Graphics.prototype.drawSnake = function(snake) {
      var cell, _i, _len, _ref, _results;
      this.context.fillStyle = snake.color;
      _ref = snake.body;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        _results.push(this.drawCell(cell[0], cell[1]));
      }
      return _results;
    };

    Graphics.prototype.drawFood = function(food) {
      var f, _i, _len, _results;
      this.context.fillStyle = '#ff0000';
      _results = [];
      for (_i = 0, _len = food.length; _i < _len; _i++) {
        f = food[_i];
        _results.push(this.drawCell(f[0], f[1]));
      }
      return _results;
    };

    return Graphics;

  })();

  Game = (function() {
    var AIController, AIController2, KeyboardController, KeyboardController2;

    function Game(canvas, width, height) {
      var snake1, snake2;
      this.canvas = canvas;
      this.width = width;
      this.height = height;
      this.field = new Field(this.width, this.height);
      this.graphics = new Graphics(this.canvas, this.field);
      snake1 = new Snake(0, 0);
      snake1.color = '#ff00ff';
      snake2 = new Snake(this.width - 1, this.height - 1);
      snake2.color = '#ffff00';
      snake2.direction = [0, -1];
      this.field.snakes.push(snake1);
      this.field.snakes.push(snake2);
      this.user1 = new KeyboardController(this.canvas, snake1);
      this.user2 = new KeyboardController2(this.canvas, snake2);
      this.ai1 = new AIController(this.field, snake1);
      this.ai2 = new AIController2(this.field, snake2);
      this.current_snake = 0;
    }

    Game.prototype.draw = function() {
      var snake, _i, _len, _ref;
      this.graphics.beginDraw();
      _ref = this.field.snakes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        snake = _ref[_i];
        this.graphics.drawSnake(snake);
      }
      return this.graphics.drawFood(this.field.food);
    };

    Game.prototype.update = function() {
      this.updateFood();
      this.current_snake %= this.field.snakes.length;
      this.updateSnake(this.field.snakes[this.current_snake++]);
      this.ai1.update();
      return this.ai2.update();
    };

    Game.prototype.updateSnake = function(snake) {
      var direction, food_index, next_cell, s, _i, _len, _ref;
      if (snake.dead) {
        return;
      }
      next_cell = this.field.normalizeCell(snake.nextCell());
      food_index = this.field.foodIndex(next_cell[0], next_cell[1]);
      if (food_index >= 0) {
        snake.body.unshift(next_cell);
        this.field.food.splice(food_index, 1);
        if (snake.isGoodDirection()) {
          return snake.direction = snake.next_direction;
        }
      } else {
        _ref = this.field.snakes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          if (s !== snake) {
            snake.dead |= s.isInBody(next_cell[0], next_cell[1]);
          }
        }
        snake.dead |= snake.isInBody(next_cell[0], next_cell[1]) && !compareCells(snake.body[snake.body.length - 1], next_cell);
        if (!snake.dead) {
          direction = snake.isGoodDirection() ? snake.next_direction : snake.direction;
          return snake.move(next_cell, direction);
        }
      }
    };

    Game.prototype.updateFood = function() {
      var count, in_snake, snake, x, y, _i, _len, _ref, _results;
      count = 3 - this.field.food.length;
      _results = [];
      while (count > 0) {
        x = Math.floor(Math.random() * this.field.width);
        y = Math.floor(Math.random() * this.field.height);
        in_snake = false;
        _ref = this.field.snakes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          snake = _ref[_i];
          if (snake.isInBody(x, y)) {
            in_snake = true;
            break;
          }
        }
        if (!in_snake) {
          this.field.food.push([x, y]);
          _results.push(--count);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    KeyboardController = (function() {
      function KeyboardController(canvas, snake) {
        var keydown;
        this.canvas = canvas;
        keydown = function(e) {
          e = e || window.event;
          if (e.keyCode === 38) {
            snake.next_direction = [0, -1];
          }
          if (e.keyCode === 40) {
            snake.next_direction = [0, 1];
          }
          if (e.keyCode === 39) {
            snake.next_direction = [1, 0];
          }
          if (e.keyCode === 37) {
            return snake.next_direction = [-1, 0];
          }
        };
        this.canvas.addEventListener('keydown', keydown, false);
      }

      return KeyboardController;

    })();

    KeyboardController2 = (function() {
      function KeyboardController2(canvas, snake) {
        var keydown;
        this.canvas = canvas;
        keydown = function(e) {
          e = e || window.event;
          if (e.keyCode === 87) {
            snake.next_direction = [0, -1];
          }
          if (e.keyCode === 83) {
            snake.next_direction = [0, 1];
          }
          if (e.keyCode === 68) {
            snake.next_direction = [1, 0];
          }
          if (e.keyCode === 65) {
            return snake.next_direction = [-1, 0];
          }
        };
        this.canvas.addEventListener('keydown', keydown, false);
      }

      return KeyboardController2;

    })();

    AIController = (function() {
      function AIController(field, snake) {
        this.field = field;
        this.snake = snake;
      }

      AIController.prototype.distance = function(cell1, cell2) {
        var absx, absy, x, y;
        absx = Math.abs(cell1[0] - cell2[0]);
        absy = Math.abs(cell1[1] - cell2[1]);
        x = Math.min(absx, this.field.width - absx);
        y = Math.min(absy, this.field.height - absy);
        return x + y;
      };

      AIController.prototype.inCollision = function(cell) {
        var in_collision, s, _i, _len, _ref;
        in_collision = false;
        _ref = this.field.snakes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          if (s !== this.snake) {
            in_collision |= s.isInBody(cell[0], cell[1]);
          }
        }
        in_collision |= this.snake.isInBody(cell[0], cell[1]) && !compareCells(this.snake.body[this.snake.body.length - 1], cell);
        return in_collision;
      };

      AIController.prototype.update = function() {
        var direction, distances, f, min_distance, next_cell, possible_directions, target, _i, _j, _len, _len1, _ref, _ref1;
        distances = [];
        if (this.field.food.length === 0) {
          return;
        }
        _ref = this.field.food;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          distances.push(this.distance(this.snake.body[0], f));
        }
        min_distance = Math.min.apply(Math, distances);
        target = this.field.food[distances.indexOf(min_distance)];
        next_cell = this.field.normalizeCell(this.snake.nextCell());
        if (this.distance(next_cell, target) < min_distance && !this.inCollision(next_cell)) {
          return;
        }
        possible_directions = [];
        distances = [];
        _ref1 = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          direction = _ref1[_j];
          this.snake.next_direction = direction;
          if (!this.snake.isGoodDirection()) {
            continue;
          }
          next_cell = this.field.normalizeCell(this.snake.nextCell());
          if (!this.inCollision(next_cell)) {
            possible_directions.push(direction);
            distances.push(this.distance(next_cell, target));
          }
        }
        if (distances.length < 1) {
          return;
        }
        min_distance = Math.min.apply(Math, distances);
        return this.snake.next_direction = possible_directions[distances.indexOf(min_distance)];
      };

      return AIController;

    })();

    AIController2 = (function() {
      function AIController2(field, snake) {
        this.field = field;
        this.snake = snake;
        this.astar = new AStar(this.field);
      }

      AIController2.prototype.update = function() {
        var d, directions, distances, f, min_distance, _i, _len, _ref;
        distances = [];
        directions = [];
        if (this.field.food.length === 0) {
          return;
        }
        _ref = this.field.food;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          d = this.astar.search(this.snake.body[0], f);
          if (d === null) {
            continue;
          }
          distances.push(d[1]);
          directions.push(d[0]);
        }
        if (distances.length < 1) {
          return;
        }
        min_distance = Math.min.apply(Math, distances);
        return this.snake.next_direction = directions[distances.indexOf(min_distance)];
      };

      return AIController2;

    })();

    return Game;

  })();

  AStar = (function() {
    var Cell;

    Cell = (function() {
      function Cell(pos) {
        this.pos = pos;
        this.init();
      }

      Cell.prototype.init = function() {
        this.g = 0;
        this.h = 0;
        this.cost = this.g + this.h;
        this.parent_cell = null;
        this.snake = false;
        this.visited = false;
        return this.cached = false;
      };

      Cell.prototype.setCost = function(h, parent_cell) {
        this.h = h;
        this.parent_cell = parent_cell != null ? parent_cell : null;
        this.g = this.parent_cell !== null ? this.parent_cell.g + 1 : 0;
        return this.cost = this.h + this.g;
      };

      return Cell;

    })();

    function AStar(field) {
      var i, x, y, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
      this.field = field;
      this.search_field = [];
      for (i = _i = 0, _ref = this.field.width; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.search_field.push(new Array(this.field.height));
      }
      for (x = _j = 0, _ref1 = this.field.width; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        for (y = _k = 0, _ref2 = this.field.height; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; y = 0 <= _ref2 ? ++_k : --_k) {
          this.search_field[x][y] = new Cell([x, y]);
        }
      }
      this.cost_map = new Array(this.field.height * this.field.width);
      for (i = _l = 0, _ref3 = this.field.width * this.field.height; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; i = 0 <= _ref3 ? ++_l : --_l) {
        this.cost_map[i] = [];
      }
      this.cost_cache = 0;
      this.count = 0;
    }

    AStar.prototype.costMapAdd = function(cell) {
      cell.cached = true;
      this.cost_map[cell.cost].push(cell);
      if (cell.cost < this.cost_cache) {
        return this.cost_cache = cell.cost;
      }
    };

    AStar.prototype.costMapGet = function() {
      ++this.count;
      while (this.cost_cache < this.cost_map.length) {
        if (this.cost_map[this.cost_cache].length > 0) {
          return this.cost_map[this.cost_cache].pop();
        }
        ++this.cost_cache;
      }
      return null;
    };

    AStar.prototype.distance = function(cell1, cell2) {
      var absx, absy, x, y;
      absx = Math.abs(cell1[0] - cell2[0]);
      absy = Math.abs(cell1[1] - cell2[1]);
      x = Math.min(absx, this.field.width - absx);
      y = Math.min(absy, this.field.height - absy);
      return x + y;
    };

    AStar.prototype.refresh = function() {
      var cell, i, snake, x, y, _i, _j, _k, _l, _len, _len1, _m, _ref, _ref1, _ref2, _ref3, _ref4;
      for (x = _i = 0, _ref = this.field.width; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        for (y = _j = 0, _ref1 = this.field.height; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          this.search_field[x][y].init();
        }
      }
      _ref2 = this.field.snakes;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        snake = _ref2[_k];
        _ref3 = snake.body;
        for (_l = 0, _len1 = _ref3.length; _l < _len1; _l++) {
          cell = _ref3[_l];
          this.search_field[cell[0]][cell[1]].cached = true;
        }
      }
      for (i = _m = 0, _ref4 = this.field.width * this.field.height; 0 <= _ref4 ? _m <= _ref4 : _m >= _ref4; i = 0 <= _ref4 ? ++_m : --_m) {
        this.cost_map[i].length = 0;
      }
      return this.count = 0;
    };

    AStar.prototype.search = function(start, target) {
      var cell, direction, neighbor, neighbor_x, neighbor_y, target_g;
      this.refresh();
      cell = this.search_field[start[0]][start[1]];
      cell.setCost(this.distance(start, target));
      this.costMapAdd(cell);
      while ((cell = this.costMapGet()) !== null) {
        cell.visited = true;
        if (compareCells(cell.pos, target)) {
          break;
        }
        neighbor_x = cell.pos[0];
        neighbor_y = (cell.pos[1] + 1) % this.field.height;
        neighbor = this.search_field[neighbor_x][neighbor_y];
        if (!neighbor.cached) {
          neighbor.setCost(this.distance(neighbor.pos, target), cell);
          this.costMapAdd(neighbor);
        }
        neighbor_x = cell.pos[0];
        neighbor_y = (cell.pos[1] - 1 + this.field.height) % this.field.height;
        neighbor = this.search_field[neighbor_x][neighbor_y];
        if (!neighbor.cached) {
          neighbor.setCost(this.distance(neighbor.pos, target), cell);
          this.costMapAdd(neighbor);
        }
        neighbor_x = (cell.pos[0] + 1) % this.field.width;
        neighbor_y = cell.pos[1];
        neighbor = this.search_field[neighbor_x][neighbor_y];
        if (!neighbor.cached) {
          neighbor.setCost(this.distance(neighbor.pos, target), cell);
          this.costMapAdd(neighbor);
        }
        neighbor_x = (cell.pos[0] - 1 + this.field.width) % this.field.width;
        neighbor_y = cell.pos[1];
        neighbor = this.search_field[neighbor_x][neighbor_y];
        if (!neighbor.cached) {
          neighbor.setCost(this.distance(neighbor.pos, target), cell);
          this.costMapAdd(neighbor);
        }
      }
      if (cell === null) {
        return null;
      }
      target_g = cell.g;
      while (cell.parent_cell.g !== 0) {
        cell = cell.parent_cell;
      }
      direction = [cell.pos[0] - start[0], cell.pos[1] - start[1]];
      if (direction[0] < -1) {
        direction[0] += this.field.width;
      }
      if (direction[0] > 1) {
        direction[0] -= this.field.width;
      }
      if (direction[1] < -1) {
        direction[1] += this.field.height;
      }
      if (direction[1] > 1) {
        direction[1] -= this.field.height;
      }
      console.log(this.count);
      return [direction, target_g];
    };

    return AStar;

  })();

  game = new Game(canvas, 20, 20);

  game.draw();

  i = 10000;

  clock = function() {
    if (--i < 0) {
      return;
    }
    setTimeout(clock, 100);
    game.update();
    return game.draw();
  };

  clock();

}).call(this);