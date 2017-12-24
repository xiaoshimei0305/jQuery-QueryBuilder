/**
 * @class Invert
 * @memberof module:plugins
 * @description Allows to es-idragon a rule operator, a group condition or the entire builder.
 * @param {object} [options]
 * @param {string} [options.icon='glyphicon glyphicon-random']
 * @param {boolean} [options.recursive=true]
 * @param {boolean} [options.invert_rules=true]
 * @param {boolean} [options.display_rules_button=false]
 * @param {boolean} [options.silent_fail=false]
 */
QueryBuilder.define('es-idragon', function(options) {
    var self = this;
    var Selectors = QueryBuilder.selectors;

    // Bind events
    this.on('afterInit', function() {

    });

    // Modify templates
    this.on('getGroupTemplate.filter', function(h, level) {
        var $h = $(h.value);
        if(level==2&&options.esTypelist.length>0){
            var esselecthtml=self.getEsTypeSelectHtml(options.esTypelist);
            $h.find(Selectors.condition_container).after(self.getEsTypeSelectHtml(options.esTypelist));
        }
      //  $h.find(Selectors.condition_container).after('<button type="button" class="btn btn-xs btn-default" data-invert="group"><i class="' + options.icon + '"></i> ' + self.translate('invert') + '</button>');
        h.value = $h.prop('outerHTML');
    });
}, {
  esTypelist:[]
});

QueryBuilder.extend(/** @lends module:plugins.es-idragon.prototype */ {
    getEsTypeSelectHtml:function(esTypelist){
      var html='<div class="es-type-condition"><select class="form-control" data-es="group">';
        for(var i=0;i<esTypelist.length;i++){
          html+='<option value="'+esTypelist[i].id+'">'+esTypelist[i].name+'</options>';
        }
      html+='</select></div>';
      return html;
    }
});
