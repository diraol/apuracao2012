Map = (function ($) {
  function initialize(element, svgPath) {
    _loadSvgInto(element, svgPath);
  };

  function _loadSvgInto(element, svgPath) {
    d3.xml(svgPath, 'image/svg+xml', function (xml) {
      element.html(xml.documentElement);
    });
  };

  return {
    'initialize': initialize
  };
})(jQuery);
