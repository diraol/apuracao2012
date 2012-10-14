(function(){
var nv = {
  version: '0.0.1a',
  dev: true //set false when in production
};

window.nv = nv;

nv.tooltip = {}; // For the tooltip system
nv.utils = {}; // Utility subsystem
nv.models = {}; //stores all the possible models/components
nv.charts = {}; //stores all the ready to use charts
nv.graphs = []; //stores all the graphs currently on the page
nv.logs = {}; //stores some statistics and potential error messages

nv.dispatch = d3.dispatch('render_start', 'render_end');

// *************************************************************************
//  Development render timers - disabled if dev = false

if (nv.dev) {
  nv.dispatch.on('render_start', function(e) {
    nv.logs.startTime = +new Date();
  });

  nv.dispatch.on('render_end', function(e) {
    nv.logs.endTime = +new Date();
    nv.logs.totalTime = nv.logs.endTime - nv.logs.startTime;
    nv.log('total', nv.logs.totalTime); // used for development, to keep track of graph generation times
  });
}

// ********************************************
//  Public Core NV functions

// Logs all arguments, and returns the last so you can test things in place
nv.log = function() {
  if (nv.dev && console.log && console.log.apply) console.log.apply(console, arguments);
  return arguments[arguments.length - 1];
};


nv.render = function render(step) {
  step = step || 1; // number of graphs to generate in each timout loop

  render.active = true;
  nv.dispatch.render_start();

  setTimeout(function() {
    var chart;

    for (var i = 0; i < step && (graph = render.queue[i]); i++) {
      chart = graph.generate();
      if (typeof graph.callback == typeof(Function)) graph.callback(chart);
      nv.graphs.push(chart);
    }

    render.queue.splice(0, i);

    if (render.queue.length) setTimeout(arguments.callee, 0);
    else { nv.render.active = false; nv.dispatch.render_end(); }
  }, 0);
};

nv.render.active = false;
nv.render.queue = [];

nv.addGraph = function(obj) {
  if (typeof arguments[0] === typeof(Function))
    obj = {generate: arguments[0], callback: arguments[1]};

  nv.render.queue.push(obj);

  if (!nv.render.active) nv.render();
};

nv.identity = function(d) { return d; };

nv.strip = function(s) { return s.replace(/(\s|&)/g,''); };

function daysInMonth(month,year) {
  return (new Date(year, month+1, 0)).getDate();
}

function d3_time_range(floor, step, number) {
  return function(t0, t1, dt) {
    var time = floor(t0), times = [];
    if (time < t0) step(time);
    if (dt > 1) {
      while (time < t1) {
        var date = new Date(+time);
        if ((number(date) % dt === 0)) times.push(date);
        step(time);
      }
    } else {
      while (time < t1) { times.push(new Date(+time)); step(time); }
    }
    return times;
  };
}

d3.time.monthEnd = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), 0);
};

d3.time.monthEnds = d3_time_range(d3.time.monthEnd, function(date) {
    date.setUTCDate(date.getUTCDate() + 1);
    date.setDate(daysInMonth(date.getMonth() + 1, date.getFullYear()));
  }, function(date) {
    return date.getMonth();
  }
);


/*****
 * A no frills tooltip implementation.
 *****/


(function() {

  var nvtooltip = window.nv.tooltip = {};

  nvtooltip.show = function(pos, content, gravity, dist, parentContainer, classes) {

    var container = document.createElement('div');
        container.className = 'nvtooltip ' + (classes ? classes : 'xy-tooltip');

    gravity = gravity || 's';
    dist = dist || 20;

    var body = parentContainer ? parentContainer : document.getElementsByTagName('body')[0];

    container.innerHTML = content;
    container.style.left = 0;
    container.style.top = 0;
    container.style.opacity = 0;

    body.appendChild(container);

    var height = parseInt(container.offsetHeight),
        width = parseInt(container.offsetWidth),
        windowWidth = nv.utils.windowSize().width,
        windowHeight = nv.utils.windowSize().height,
        scrollTop = body.scrollTop,
        scrollLeft = body.scrollLeft,
        left, top;


    switch (gravity) {
      case 'e':
        left = pos[0] - width - dist;
        top = pos[1] - (height / 2);
        if (left < scrollLeft) left = pos[0] + dist;
        if (top < scrollTop) top = scrollTop + 5;
        if (top + height > scrollTop + windowHeight) top = scrollTop - height - 5;
        break;
      case 'w':
        left = pos[0] + dist;
        top = pos[1] - (height / 2);
        if (left + width > windowWidth) left = pos[0] - width - dist;
        if (top < scrollTop) top = scrollTop + 5;
        if (top + height > scrollTop + windowHeight) top = scrollTop - height - 5;
        break;
      case 'n':
        left = pos[0] - (width / 2);
        top = pos[1] + dist;
        if (left < scrollLeft) left = scrollLeft + 5;
        if (left + width > windowWidth) left = windowWidth - width - 5;
        if (top + height > scrollTop + windowHeight) top = pos[1] - height - dist;
        break;
      case 's':
        left = pos[0] - (width / 2);
        top = pos[1] - height - dist;
        if (left < scrollLeft) left = scrollLeft + 5;
        if (left + width > windowWidth) left = windowWidth - width - 5;
        if (scrollTop > top) top = pos[1] + 20;
        break;
    }


    container.style.left = left+'px';
    container.style.top = top+'px';
    container.style.opacity = 1;
    container.style.position = 'absolute'; //fix scroll bar issue
    container.style.pointerEvents = 'none'; //fix scroll bar issue

    return container;
  };

  nvtooltip.cleanup = function() {

      // Find the tooltips, mark them for removal by this class (so others cleanups won't find it)
      var tooltips = document.getElementsByClassName('nvtooltip');
      var purging = [];
      while(tooltips.length) {
        purging.push(tooltips[0]);
        tooltips[0].style.transitionDelay = '0 !important';
        tooltips[0].style.opacity = 0;
        tooltips[0].className = 'nvtooltip-pending-removal';
      }


      setTimeout(function() {

          while (purging.length) {
             var removeMe = purging.pop();
              removeMe.parentNode.removeChild(removeMe);
          }
    }, 500);
  };


})();

nv.utils.windowSize = function() {
    // Sane defaults
    var size = {width: 640, height: 480};

    // Earlier IE uses Doc.body
    if (document.body && document.body.offsetWidth) {
        size.width = document.body.offsetWidth;
        size.height = document.body.offsetHeight;
    }

    // IE can use depending on mode it is in
    if (document.compatMode=='CSS1Compat' &&
        document.documentElement &&
        document.documentElement.offsetWidth ) {
        size.width = document.documentElement.offsetWidth;
        size.height = document.documentElement.offsetHeight;
    }

    // Most recent browsers use
    if (window.innerWidth && window.innerHeight) {
        size.width = window.innerWidth;
        size.height = window.innerHeight;
    }
    return (size);
};



// Easy way to bind multiple functions to window.onresize
// TODO: give a way to remove a function after its bound, other than removing alkl of them
nv.utils.windowResize = function(fun){
  var oldresize = window.onresize;

  window.onresize = function(e) {
    if (typeof oldresize == 'function') oldresize(e);
    fun(e);
  }
}

// Backwards compatible way to implement more d3-like coloring of graphs.
// If passed an array, wrap it in a function which implements the old default
// behaviour
nv.utils.getColor = function(color) {
    if (!arguments.length) return nv.utils.defaultColor(); //if you pass in nothing, get default colors back

    if( Object.prototype.toString.call( color ) === '[object Array]' )
        return function(d, i) { return d.color || color[i % color.length]; };
    else
        return color;
        //can't really help it if someone passes rubish as color
}

// Default color chooser uses the index of an object as before.
nv.utils.defaultColor = function() {
    var colors = d3.scale.category20().range();
    return function(d, i) { return d.color || colors[i % colors.length] };
}



// From the PJAX example on d3js.org, while this is not really directly needed
// it's a very cool method for doing pjax, I may expand upon it a little bit,
// open to suggestions on anything that may be useful
nv.utils.pjax = function(links, content) {
  d3.selectAll(links).on("click", function() {
    history.pushState(this.href, this.textContent, this.href);
    load(this.href);
    d3.event.preventDefault();
  });

  function load(href) {
    d3.html(href, function(fragment) {
      var target = d3.select(content).node();
      target.parentNode.replaceChild(d3.select(fragment).select(content).node(), target);
      nv.utils.pjax(links, content);
    });
  }

  d3.select(window).on("popstate", function() {
    if (d3.event.state) load(d3.event.state);
  });
}


// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/

nv.models.bullet = function() {

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var margin = {top: 0, right: 0, bottom: 0, left: 0}
    , orient = 'left' // TODO top & bottom
    , reverse = false
    , ranges = function(d) { return d.dados2008 }
    , markers = function(d) { return d.valorFinal2008 }
    , measures = function(d) { return d.dados2012 }
    , forceX = 0 // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
    , width = 380
    , height = 20
    , tickFormat = null
    , dispatch = d3.dispatch('elementMouseover', 'elementMouseout')
    ;

  //============================================================
    

  function chart(selection) {
    selection.each(function(d, i) {
      var availableWidth = width - margin.left - margin.right - 4,
          availableHeight = height - margin.top - margin.bottom,
          container = d3.select(this),
          mainGroup = this.parentNode.parentNode.getAttribute('transform'),
          heightFromTop = parseInt(mainGroup.replace(/.*,(\d+)\)/,"$1")) //TODO: There should be a smarter way to get this value

      var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
          markerz = markers.call(this, d, i).slice().sort(d3.descending),
          measurez = measures.call(this, d, i).slice().sort(d3.descending);
      //------------------------------------------------------------
      // Setup Scales

      // Compute the new x-scale.
      var MaxX = Math.max(rangez[0] ? rangez[0]:0 , markerz[0] ? markerz[0] : 0 , measurez[0] ? measurez[0] : 0)
      var x1 = d3.scale.linear()
          .domain([0, forceX]).nice()  // TODO: need to allow forceX and forceY, and xDomain, yDomain
          .range(reverse ? [availableWidth, 0] : [0, availableWidth]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      //------------------------------------------------------------


      //------------------------------------------------------------
      // Setup containers and skeleton of chart

      var wrap = container.selectAll('g.nv-wrap.nv-bullet').data([d]);
      var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bullet');
      var gEnter = wrapEnter.append('g');
      var g = wrap.select('g');

      wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      //------------------------------------------------------------



      var w0 = function(d) { return Math.abs(x0(d) - x0(0)) }, // TODO: could optimize by precalculating x0(0) and x1(0)
          w1 = function(d) { return Math.abs(x1(d) - x1(0)) };


      // Update the range rects.
      var range = g.selectAll('rect.nv-range')
          .data(rangez);

      function legenda_partido() {
            if (projecao=="votos") {
                var conteudo_html = ""
                if (!pilhaJson.length)
                    conteudo_html = '<table><caption>Votos recebidos pelo '+ d.title.toUpperCase() + '</caption>'
                else
                    conteudo_html = '<table><caption>Votos recebidos pelo '+ jsonAtual.split("_")[1].toUpperCase() + ' (' + d.title.toUpperCase() + ')</caption>'
                conteudo_html += '<thead><tr><th></th><th>2008</th><th>2012</th><tr/></thead><tbody>'
                conteudo_html += '<tr><th>No 1˚ turno</th>'
                    conteudo_html += '<td class="leg20081turno">' + formataNumero(d.dados2008[0]) + '</td>'
                    conteudo_html += '<td class="leg20121turno">' + formataNumero(d.dados2012[0]) + '</td></tr>'
                conteudo_html += '<tr><th>Máximo possível no 2˚ turno</th>'
                    conteudo_html += '<td class="leg20082turno">' + formataNumero(d.dados2008[1] - d.dados2008[0]) + '</td>'
                    conteudo_html += '<td class="leg20122turno">' + formataNumero(d.dados2012[1] - d.dados2012[0]) + '</td></tr>'
                conteudo_html += '<tr><th>Total (1˚ e 2˚ turnos)</th>'
                    conteudo_html += '<td class="leg2008final">' + formataNumero(d.valorFinal2008[0]) + '</td><td></td></tr>'
                conteudo_html += '</tbody></table>'
            
            } else if (projecao=="eleitorado") {
                var conteudo_html = ""
                if (!pilhaJson.length)
                    conteudo_html = '<table><caption>Eleitorado a ser governado pelo '+ d.title.toUpperCase() + '</caption>'
                else
                    conteudo_html = '<table><caption>Eleitorado a ser governado pelo '+ jsonAtual.split("_")[1].toUpperCase() + ' (' + d.title.toUpperCase() + ')</caption>'
                conteudo_html += '<thead><tr><th></th><th>2008</th><th>2012</th><tr/></thead><tbody>'
                conteudo_html += '<tr><th>No 1˚ turno</th>'
                    conteudo_html += '<td class="leg20081turno">' + formataNumero(d.dados2008[0]) + '</td>'
                    conteudo_html += '<td class="leg20121turno">' + formataNumero(d.dados2012[0]) + '</td></tr>'
                conteudo_html += '<tr><th>Máximo possível no 2˚ turno</th>'
                    conteudo_html += '<td class="leg20082turno">' + formataNumero(d.dados2008[1] - d.dados2008[0]) + '</td>'
                    conteudo_html += '<td class="leg20122turno">' + formataNumero(d.dados2012[1] - d.dados2012[0]) + '</td></tr>'
                conteudo_html += '<tr><th>Total (1˚ e 2˚ turnos)</th>'
                    conteudo_html += '<td class="leg2008final">' + formataNumero(d.valorFinal2008[0]) + '</td><td></td></tr>'
                conteudo_html += '</tbody></table>'
            
            } else {
                var conteudo_html = ""
                if (pilhaJson.length)
                    conteudo_html = '<table><caption>Prefeitos do '+ jsonAtual.split("_")[1].toUpperCase() + ' (' + d.title.toUpperCase() + ')</caption>'
                else
                    conteudo_html = '<table><caption>Prefeitos do '+ d.title.toUpperCase() + '</caption>'
                conteudo_html += '<thead><tr><th></th><th>2008</th><th>2012</th><tr/></thead><tbody>'
                conteudo_html += '<tr><th>Eleitos no 1˚ turno</th>'
                    conteudo_html += '<td class="leg20081turno">' + formataNumero(d.dados2008[0]) + '</td>'
                    conteudo_html += '<td class="leg20121turno">' + formataNumero(d.dados2012[0]) + '</td></tr>'
                conteudo_html += '<tr><th>Classificados para<br/> o 2˚ turno</th>'
                    conteudo_html += '<td class="leg20082turno">' + formataNumero(d.dados2008[1] - d.dados2008[0]) + '</td>'
                    conteudo_html += '<td class="leg20122turno">' + formataNumero(d.dados2012[1] - d.dados2012[0]) + '</td></tr>'
                conteudo_html += '<tr><th>Eleitos (1˚ e 2˚ turnos)</th>'
                    conteudo_html += '<td class="leg2008final">' + formataNumero(d.valorFinal2008[0]) + '</td><td></td></tr>'
                conteudo_html += '</tbody></table>'
            }
                    return conteudo_html
      }

      range.enter().append('rect')
          .attr('class', function(d, i) { return 'nv-range nv-s' + i; })
          .attr('width', w0)
          .attr('height', availableHeight)
          .attr('x', reverse ? x0 : 0)
          .on('mouseover', function(d,i) {
                dispatch.elementMouseover({
                    conteudo: legenda_partido(),
                    value: d,
                    label: (i <= 0) ? '' : (i > 1) ? 'Eleitos em<br/>Primeiro Turno<br/>em 2008:' : 'Eleitos em<br/>Segundo Turno</br>em 2008:', //TODO: make these labels a variable
                    pos: [x1(d), heightFromTop]
                })
          })
          .on('mouseout', function(d,i) { 
              dispatch.elementMouseout({
                value: d,
                label: (i <= 0) ? '' : (i >=1) ? 'Eleitos em<br/>Primeiro Turno<br/>em 2008:' : 'Eleitos em<br/>Segundo Turno</br>em 2008:' //TODO: make these labels a variable
              })
          })

      d3.transition(range)
          .attr('x', reverse ? x1 : 0)
          .attr('width', w1)
          .attr('height', availableHeight);


      // Update the measure rects.
      var measure = g.selectAll('rect.nv-measure')
          .data(measurez);

      measure.enter().append('rect')
          .attr('class', function(d, i) { return 'nv-measure nv-s' + i; })
          .attr('width', w0)
          .attr('height', availableHeight / 2)
          .attr('x', reverse ? x0 : 0)
          .attr('y', availableHeight / 2)
          .on('mouseover', function(d,i) { 
              dispatch.elementMouseover({
                conteudo: legenda_partido(),
                value: d,
                label: (i<=0) ? 'Total possível de eleitos<br/>ao fim do segundo turno:' : 'Total de eleitos<br/>em primeiro turno:', //TODO: make these labels a variable
                pos: [x1(d), heightFromTop]
              })
          })
          .on('mouseout', function(d) { 
              dispatch.elementMouseout({
                value: d,
                label: 'Current' //TODO: make these labels a variable
              })
          })

      d3.transition(measure)
          .attr('width', w1)
          .attr('height', availableHeight / 2)
          .attr('x', reverse ? x1 : 0)
          .attr('y', availableHeight / 4);



      // Update the marker lines.
      var marker = g.selectAll('path.nv-markerLine')
          .data(markerz);

      var h3 =  availableHeight / 2;
      marker.enter().append('path')
          .attr('class', 'nv-markerLine')
          .attr('transform', function(d) { return 'translate(' + x0(d) + ',' + (availableHeight / 2) + ')' })
          .attr('d', 'M0 ' + (-h3/2) + ' v ' + h3 + ' ' + (-h3))
          .on('mouseover', function(d,i) {
              dispatch.elementMouseover({
                    conteudo: legenda_partido(),
                value: d,
                label: 'Total de Prefeitos eleitos em 2008',
                pos: [x1(d), heightFromTop]
              })
          })
          .on('mouseout', function(d,i) {
              dispatch.elementMouseout({
                value: d,
                label: 'Total de Prefeitos eleitos em 2008'
              })
          });

      d3.transition(marker)
          .attr('transform', function(d) { return 'translate(' + x1(d) + ',' + (availableHeight / 2) + ')' });

      marker.exit().remove();

    });

    d3.timer.flush();

    return chart;
  }


  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  chart.dispatch = dispatch;

  // left, right, top, bottom
  chart.orient = function(_) {
    if (!arguments.length) return orient;
    orient = _;
    reverse = orient == 'right' || orient == 'bottom';
    return chart;
  };

  // ranges (bad, satisfactory, good)
  chart.ranges = function(_) {
    if (!arguments.length) return ranges;
    ranges = _;
    return chart;
  };

  // markers (previous, goal)
  chart.markers = function(_) {
    if (!arguments.length) return markers;
    markers = _;
    return chart;
  };

  // measures (actual, forecast)
  chart.measures = function(_) {
    if (!arguments.length) return measures;
    measures = _;
    return chart;
  };

  chart.forceX = function(_) {
    if (!arguments.length) return forceX;
    forceX = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return chart;
  };

  //============================================================


  return chart;
};



// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
nv.models.bulletChart = function() {


  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var bullet = nv.models.bullet()
    ;

  var orient = 'left' // TODO top & bottom
    , reverse = false
    , margin = {top: 5, right: 01, bottom: 20, left: 40}
    , ranges = function(d) { return d.dados2008 }
    , markers = function(d) { return d.valorFinal2008 }
    , measures = function(d) { return d.dados2012 }
    , width = null
    , height = 30
    , tickFormat = null
    , forceX = 0
    , tooltips = true
    , tooltip = function(key, x, y, e, graph) {
        return '<h3>' + e.label + '</h3>' +
               '<p>' +  e.value + '</p>'
      }
    , noData = "No Data Available."
    , dispatch = d3.dispatch('tooltipShow', 'tooltipHide')
    ;

  //============================================================


  //============================================================
  // Private Variables
  //------------------------------------------------------------

  var showTooltip = function(e, parentElement) {
    var offsetElement = parentElement.parentNode.parentNode
    var content = '<h3>' + e.label + '</h3>' +
                '<p>' + e.value + '</p>';
    left = d3.mouse(parentElement)[0]
    top = d3.mouse(parentElement)[1]
    nv.tooltip.show([left, top], e.conteudo, e.value < 0 ? 'e' : 'w', null, offsetElement.parentNode);
  };

  //============================================================
  
  
  function chart(selection) {
    //Calculate maximum X for scaling

    function escala(dados) {
        if(pilhaJson.length) {
            var comparador = pilhaJson[pilhaJson.length - 1] + "_outros"
        }
        if(!pilhaJson.length) {
            //Se pilha vazia, primeiro gráfico, calcula escala
            return calculaEscala(dados)
        } else if (comparador == jsonAtual) {
            forceX = baseEscala
            return baseEscala  
        } else {
            //Verifica se está transitando de/para estados.
            return calculaEscala(dados)
        }
    }

    function calculaEscala(dados) {
        dados.each(function(d) {
            for (var i=0; i < d.dados2008.length; i++)
                if (d.dados2008[i] > forceX)
                    forceX = d.dados2008[i]
            for (var i=0; i < d.dados2012.length; i++)
                if (d.dados2012[i] > forceX)
                    forceX = d.dados2012[i]
            baseEscala = forceX
        })
        return forceX
    }

    bullet.forceX(escala(selection))
    
    selection.each(function(d, i) {
      var container = d3.select(this);
      var availableWidth = (width  || parseInt(container.style('width')) || 960)
                             - margin.left - margin.right,
          availableHeight = height - margin.top - margin.bottom,
          that = this;

      chart.update = function() { chart(selection) };
      chart.container = this;

      //------------------------------------------------------------
      // Display No Data message if there's nothing to show.

      /*
      // Disabled until I figure out a better way to check for no data with the bullet chart
      if (!data || !data.length || !data.filter(function(d) { return d.values.length }).length) {
        var noDataText = container.selectAll('.nv-noData').data([noData]);

        noDataText.enter().append('text')
          .attr('class', 'nvd3 nv-noData')
          .attr('dy', '-.7em')
          .style('text-anchor', 'middle');

        noDataText
          .attr('x', margin.left + availableWidth / 2)
          .attr('y', margin.top + availableHeight / 2)
          .text(function(d) { return d });

        return chart;
      } else {
        container.selectAll('.nv-noData').remove();
      }
      */

      //------------------------------------------------------------

      var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
          markerz = markers.call(this, d, i).slice().sort(d3.descending),
          measurez = measures.call(this, d, i).slice().sort(d3.descending);

      //------------------------------------------------------------
      // Setup containers and skeleton of chart

      var wrap = container.selectAll('g.nv-wrap.nv-bulletChart').data([d]);
      var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bulletChart').attr('id',function(d) {return 'container' + d.title});
      var gEnter = wrapEnter.append('g');
      var g = wrap.select('g');

      gEnter.append('g').attr('class', 'nv-bulletWrap');
      gEnter.append('g').attr('class', 'nv-titles');

      wrap.attr('transform', 'translate(' + margin.left + ',' + ( margin.top + i*(height-margin.top-margin.bottom+4) )+ ')');

      //------------------------------------------------------------


      // Compute the new x-scale.
      var MaxX = Math.max(rangez[0] ? rangez[0]:0 , markerz[0] ? markerz[0] : 0 , measurez[0] ? measurez[0] : 0)
      var x1 = d3.scale.linear()
          .domain([0, forceX]).nice()  // TODO: need to allow forceX and forceY, and xDomain, yDomain
          .range(reverse ? [availableWidth, 0] : [0, availableWidth]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      /*
      // Derive width-scales from the x-scales.
      var w0 = bulletWidth(x0),
          w1 = bulletWidth(x1);

      function bulletWidth(x) {
        var x0 = x(0);
        return function(d) {
          return Math.abs(x(d) - x(0));
        };
      }

      function bulletTranslate(x) {
        return function(d) {
          return 'translate(' + x(d) + ',0)';
        };
      }
      //*/

      var w0 = function(d) { return Math.abs(x0(d) - x0(0)) }, // TODO: could optimize by precalculating x0(0) and x1(0)
          w1 = function(d) { return Math.abs(x1(d) - x1(0)) };

      var title = gEnter.select('.nv-titles').append("g")
          .attr("text-anchor", "end")
          .attr("transform", "translate(-6," + (height - margin.top - margin.bottom + 8) / 2 + ")");
      title.append("text")
          .attr("class", "nv-title")
          .text(function(d) { return d.title; });

      title.append("text")
          .attr("class", "nv-subtitle")
          .attr("dy", "1em")
          .text(function(d) { return d.subtitle; });

      bullet
        .width(availableWidth)
        .height(availableHeight)

      var bulletWrap = g.select('.nv-bulletWrap');

      d3.transition(bulletWrap).call(bullet);

      //*
      //Allow only one scale for all bullets
      if (i==selection[0].length-1){
      /*///
      //Allow all scales
      if (true) {
      //*///

        // Compute the tick format.
        var format = tickFormat || x1.tickFormat(8);


        // Update the tick groups.
        var tick = g.selectAll('g.nv-tick')
            .data(x1.ticks(8), function(d) {
              return this.textContent || format(d);
            });

        // Initialize the ticks with the old scale, x0.
        var tickEnter = tick.enter().append('g')
            .attr('class', 'nv-tick')
            .attr('transform', function(d) { return 'translate(' + x0(d) + ',0)' })
            .style('opacity', 1e-6);

        tickEnter.append('line')
            .attr('y1', availableHeight)
            .attr('y2', availableHeight * 7 / 6);

        tickEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .attr('y', availableHeight * 7 / 6)
            .text(format);

        // Transition the entering ticks to the new scale, x1.
        d3.transition(tickEnter)
            .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
            .style('opacity', 1);

        // Transition the updating ticks to the new scale, x1.
        var tickUpdate = d3.transition(tick)
            .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
            .style('opacity', 1);

        tickUpdate.select('line')
            .attr('y1', availableHeight)
            .attr('y2', availableHeight * 7 / 6);

        tickUpdate.select('text')
            .attr('y', availableHeight * 7 / 6);

        // Transition the exiting ticks to the new scale, x1.
        d3.transition(tick.exit())
            .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
            .style('opacity', 1e-6)
            .remove();
    }
      
      //============================================================
      // Event Handling/Dispatching (in chart's scope)
      //------------------------------------------------------------

      dispatch.on('tooltipShow', function(e) {
        if (tooltips) showTooltip(e, that);
      });

      //============================================================

    });

    d3.timer.flush();

    return chart;
  }


  //============================================================
  // Event Handling/Dispatching (out of chart's scope)
  //------------------------------------------------------------

  bullet.dispatch.on('elementMouseover.tooltip', function(e) {
    dispatch.tooltipShow(e);
  });

  bullet.dispatch.on('elementMouseout.tooltip', function(e) {
    dispatch.tooltipHide(e);
  });

  dispatch.on('tooltipHide', function() {
    if (tooltips) nv.tooltip.cleanup();
  });

  //============================================================


  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  chart.dispatch = dispatch;
  chart.bullet = bullet;

  // left, right, top, bottom
  chart.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    reverse = orient == 'right' || orient == 'bottom';
    return chart;
  };

  // ranges (bad, satisfactory, good)
  chart.ranges = function(x) {
    if (!arguments.length) return ranges;
    ranges = x;
    return chart;
  };

  // markers (previous, goal)
  chart.markers = function(x) {
    if (!arguments.length) return markers;
    markers = x;
    return chart;
  };

  // measures (actual, forecast)
  chart.measures = function(x) {
    if (!arguments.length) return measures;
    measures = x;
    return chart;
  };

  chart.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return chart;
  };

  chart.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return chart;
  };

  chart.tooltips = function(_) {
    if (!arguments.length) return tooltips;
    tooltips = _;
    return chart;
  };

  chart.tooltipContent = function(_) {
    if (!arguments.length) return tooltip;
    tooltip = _;
    return chart;
  };

  chart.noData = function(_) {
    if (!arguments.length) return noData;
    noData = _;
    return chart;
  };

  //============================================================


  return chart;
};

})();
