/**
 * @class mdc_es_type
 * @memberof module:plugins
 * @description Allows to mdc_es_type a rule operator, a group condition or the entire builder.
 * @param {object} [options]
 * @param {string} [options.icon='glyphicon glyphicon-random']
 * @param {boolean} [options.recursive=true]
 * @param {boolean} [options.mdc_es_type_rules=true]
 * @param {boolean} [options.display_rules_button=false]
 * @param {boolean} [options.silent_fail=false]
 */ 
QueryBuilder.define('mdc-es', function(options) {
    var self = this;
    var Selectors = QueryBuilder.selectors;
   // Bind events
    this.on('afterInit', function() {
		self.$el.on('change.queryBuilder', '[data-mdc-es-select=group]', function() {
			var $group = $(this).closest(Selectors.group_container);
			self.mdcgroupselect(self.getModel($group),this.value);
		});
		self.$el.on('change.queryBuilder', '[data-mdc-es-select=rule]', function() {
			 var $rule = $(this).closest(Selectors.rule_container);
			 self.mdcruleselect(this,self.getModel($rule),this.dataset['mdcEsSelectPath']);
		});
    });

    // Modify templates
    this.on('getGroupTemplate.filter', function(h, level) {
        if(level==2){
            var $h = $(h.value);
            var optionsStr='';
            for(var i=0;i<options.types.length;i++ ){
                var item=options.types[i];
                optionsStr+='<option value="'+item.id+'">'+item.name+'</option>';
            }
            $h.find(Selectors.condition_container).after('<div class="group-mdc-select-container"><select data-mdc-es-select="group"  class="form-control btn-group">'+optionsStr+'</select><div>');
            h.value = $h.prop('outerHTML');
        }
    });
	this.on('afterUpdateRuleFilter', function(e, rule) {
		//初始化输入框
		var $mdcSelectDiv=rule.$el.find('.rule-mdc-select-container');
		if(!$mdcSelectDiv[0]){
			rule.$el.find('.rule-filter-container').after('<div class="rule-mdc-select-container"></div>');
			$mdcSelectDiv=rule.$el.find('.rule-mdc-select-container');
		}
		var selectStr = e.builder.mdcgetruleselectStr(rule.filter.mdcselect,'');
		if(selectStr){
			$mdcSelectDiv.append(selectStr);
			$mdcSelectDiv.find('select').trigger('change');//初次触发值变换事件
		}else{
			$mdcSelectDiv.empty();
		}
    });
	this.on('beforeCreateRuleFilters', function(e,rule,filterConf) {
		var mdcselect=rule.parent.$el.find('.group-mdc-select-container select');
		var esType=options.defatulEsType;
		if(mdcselect.length>0){
			esType=mdcselect[0].value;
		}
		var sourceFilters=filterConf.filters;
		filterConf.newFilters=e.builder.mdcgetFilters(esType,filterConf.filters);
    });
}, {
    icon: 'glyphicon glyphicon-random',
    recursive: true,
    mdc_es_type_rules: true,
    silent_fail: false,
	defatulEsType:'page'
});
QueryBuilder.extend({
	//获取Es查询语句
	mdcGetEsQuery:function(options){
		if(options==null){
			options={};
		} 
		options.mdcRuleToJson=function(ruleData, rule){//对获取的数据添加插件的特性
			ruleData.cherry="fuck";
		};
		options.mdcGroupToJson=function(groupData,group){//对获取的group数据进行插件添加
			var groupSelect=group.$el.find('[data-mdc-es-select=group]');
			groupData.merry="fuck";
		};
		if(this.validate()){
			return this.getRules(options);
		}
        if (!data) {
            return {};
        }
		return {msg:'抱歉，请完善请求查询参数'};
	},
	//初始化Es查询语句
	mdcSetEsQuery:function(json){
		
	},
	//获取可用的fiters
	mdcgetFilters:function(esType,sourceFilters){
		if(esType&&sourceFilters!=null&&sourceFilters.length>0){
			var list=[];
			for(var i=0;i<sourceFilters.length;i++){
				var item=sourceFilters[i];
				if(item&&item.mdctype&&item.mdctype.length>0){
					var result=this.mdclocatListItem(item.mdctype,null,esType);
					if(result){
						list.push(item);
					}
				}
			}
			return list;
		}
		return sourceFilters;
	},
	//获取下拉框列表select 的html文档
	mdcgetruleselectStr:function(selectItem,parentPath){
		if(selectItem==null||!selectItem.select||selectItem.select.length<1||!selectItem.id) return null;
		var currentPath=selectItem.id;
		if(parentPath){
			currentPath=parentPath+'.'+currentPath;
		}
		var selectStr='<select class="form-control" data-mdc-es-select="rule" data-mdc-es-select-path='+currentPath+'>';
		selectItem.select.forEach(function(item,i){
				selectStr+='<option value="'+item.id+'">'+item.name+'</rule>';
			});
		selectStr+='</select>';
		return selectStr;
	},
	mdcgroupselect:function(group){//切换表，则初始化group
		group.empty();
		this.addRule(group);
	},
	//插件rule下拉框点击事件
	mdcruleselect:function(e,rule,currentPath){
		var currentItem=this.mdcselectItem(rule.filter.mdcselect,currentPath);
		//获取选中的值
		if(currentItem){
			var selectItem=this.mdclocatListItem(currentItem.select,'id',e.value);
			if(selectItem){
				var selectStr=this.mdcgetruleselectStr(selectItem,currentPath);
				$(e).nextAll().remove();
				$(e).after(selectStr);	
				$(e).next().trigger('change');
			}
		}
	},
	mdclocatListItem:function(list,key,value){//定位指定列表数据
		if(list!=null&&list.length>0){
			for(var i=0;i<list.length;i++){
				var item=list[i];
				if(key){
					if(item[key]==value){
						return item;
					}
				}else{
					if(item==value){
						return item;
					}
				}

			}
		}
		return null;
	},
    /**
     获取下拉框选项列表
     */
    mdcselectItem: function(mdcselectRoot,parentIds) {
		var self=this;
        if (!mdcselectRoot) {
            return null;
        }
		if(parentIds){
			var myItem=null;
			var ids=parentIds.split('\.');
			if(ids!=null&&ids.length>0){
				list=[mdcselectRoot];
				ids.forEach(function(id){
					var item=self.mdclocatListItem(list,'id',id);
					if(item){
						myItem=item;
						list=item.select;
					}else{
						return null;
					}
				});
			}
			return myItem;
		}else{
			return mdcselectRoot;
		}
    }
});

