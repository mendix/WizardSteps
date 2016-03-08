/*
    WizardSteps
    ========================

    @file      : WizardSteps.js
    @version   : 1.0.0
    @author    : Willem Gorisse
    @date      : 08/03/2016
    @copyright : Mendix 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate. 
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/text!WizardSteps/widget/template/WizardStepsList.html",
    "dojo/text!WizardSteps/widget/template/WizardStep.html",
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, widgetTemplate, stepTemplate) {
    "use strict";
    
    var listItemWidget = declare([ _WidgetBase, _TemplatedMixin ], {
        templateString: stepTemplate,
        
        // DOM elements
        wizardStepButton: null,
        wizardStepNumber: null,
        wizardStepTitle: null,
        wizardStepSubTitle: null,

        numberingMode: null,
        clickListener: null,
        _data: null,
        
        constructor: function(data) {
            this._data = data;
            //Question how to deal with ${var} that is undefined? 
            if (!this._data.title || this._data.title === undefined){
               this._data.title = "";     
            }
            if (!this._data.subTitle || this._data.subTitle === undefined){
               this._data.subTitle = "";     
            }
            //dom('div', {id:"bla"}, $("span", "de tekst"));   // kan domnodes zijn, string, fragments */ 
           //  dom("#", .... ) is een fragment */ 
        },
        
        postCreate: function() {           
            this._updateRendering();
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },
        
        _updateRendering: function() {
            if (this._data) {
                if (this._data.title === "") {
                    dojoConstruct.destroy(this.wizardStepTitle);
                }
                if (this._data.subTitle === ""){
                    dojoConstruct.destroy(this.wizardStepSubTitle);
                }
                if (this.numberingMode == "noNumber")  {
                    dojoConstruct.destroy(this.wizardStepNumber)
                }              
                // setting classnames
                var stepClass = "wizard-step " + this._data.status;
                dojoClass.remove(this.wizardStepButton);
                dojoClass.add(this.wizardStepButton,stepClass);
            }
        }
    });
    
    // Declare widget's prototype. 
    return declare("WizardSteps.widget.WizardSteps", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        wizardStepsListNode: null,

        // Parameters configured in the Modeler.        
        wizardStep: null,
        titleAttribute: null,
        statusAttribute: null,
        sortAttribute: null,
        subTitleAttribute: null,

        progressStyling: null,
        autoWidth: null,
        layoutMode: null,
        numberingMode: null,

        dataMode: null,
        navigationMicroflow: null,
        dataMicroflow: null,
        useDataMicroflowContextObj: null,
        xpath: null,
        associatedWizardSteps: null,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _contextObj: null,
        _wizardStepList: null,
        _numberOfSteps: null,
        _dataRequestID: null,
        

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            this._wizardStepList = [];
            this._numberOfSteps = 0;
            this._dataRequestID = 0;
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {            

        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            this._contextObj = obj;
            this._resetSubscriptions();
            this._resetWidget();
            this._getData(callback);
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {},

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {},

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function(box) {},

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // handle incoming data
        _getData: function(callback) {
            // add an ID to the datarequest to only handle the latest incoming request. Sometimes update and the contextobj handler are both triggered.
            this._dataRequestID = mendix.lang.getUniqueId();
            var id = this._dataRequestID;
            // function voor adding the callback to the received data
            function receivedData(objs) {
                // if the received data is not of the last request: do nothing with it
                if (id == this._dataRequestID) {
                    this._processData(objs,callback);
                }
            }

            // get new data
            switch (this.dataMode) {
                case "xpathDataMode":
                    if (this._contextObj && this.xpath) {
                        var newxPath = "//" + this.wizardStep + this.xpath.replace(/\[%CurrentObject%\]/g, this._contextObj.getGuid());
                        mx.data.get({
                            xpath:newxPath,
                            filter: {
                                sort: [[this.sortAttribute, "asc"]]
                            },
                            
                            callback: receivedData
                        },this);
                    }
                    break;
                case "associationDataMode":
                    if (this._contextObj && this.associatedWizardSteps) {
                        this._contextObj.fetch(this.associatedWizardSteps, dojoLang.hitch(this,receivedData));
                    }
                    break;
                case "microflowDataMode":
                default:
                    if (this.dataMicroflow) {
                        // if a contextObj is present, pass it to the microflow
                        var dataGuids = [];
                        var dataSelection = "none";
                        if (this.useDataMicroflowContextObj && this._contextObj) {
                            dataGuids = [this._contextObj.getGuid()];
                            dataSelection = "selection";
                        }
                        mx.data.action({
                            params: {
                                actionname: this.dataMicroflow,
                                applyto: dataSelection,
                                guids: dataGuids
                            },
                            callback: dojoLang.hitch(this,receivedData)
                        },this);
                       
                    }
            }
        },
        
        _processData: function(objs,callback) {
            // if a list already exist: reset the widget
            if (this._wizardStepList && this._wizardStepList.length > 0) {
                this._resetWidget();
            }

            var step;

            // create a data list with all the steps
            this._wizardStepList = dojo.map(objs,dojoLang.hitch(this,function(stepContext,i) { 
                step = {
                    context:stepContext,
                    status:stepContext.get(this.statusAttribute),
                    numberingMode:this.numberingMode,
                    title:stepContext.get(this.titleAttribute),
                    subTitle:stepContext.get(this.subTitleAttribute)
                };
                // define number on type of number
                switch(this.numberingMode){
                    case "autoNumber":
                        step.number = i + 1;
                        break;
                    case "sortNumber":
                        step.number = stepContext.get(this.sortAttribute);
                        break;
                    case "noNumber":
                    default:
                        step.number = -1;
                }
               
                return step;
            }));

            this._numberOfSteps = this._wizardStepList.length;
            
            this._updateRendering(callback);
        },
        
         // Rerender the interface
        _updateRendering: function(callback) {
            var listItemData,
                ulClassName = "wizard-steps";
            
            switch (this.layoutMode) {
                case "verticalMode":
                    ulClassName += " vertical-wizard-steps";
                    break;
                case "horizontalMode":
                default:
                    ulClassName += " horizontal-wizard-steps";
            }
            // set proper classname on the ul
            if (this.autoWidth && this.layoutMode == "horizontalMode") {
                ulClassName += " wizard-" + this._numberOfSteps + "-steps";
            }
            dojoClass.remove(this.wizardStepsListNode);
            dojoClass.add(this.wizardStepsListNode,ulClassName);
            if (this.progressStyling) {
                dojoClass.add(this.wizardStepsListNode, "wizard-progress");
            }
            
            // create list items 
            dojoArray.forEach(this._wizardStepList,dojoLang.hitch(this,function(step,i){
                listItemData = {
                    dataId:i,
                    numberingMode:step.numberingMode,
                    number:step.number,
                    status:step.status,
                    title:step.title,
                    subTitle:step.subTitle,
                    contextObject:step.context
                };
                
                step.listItemWidget = new listItemWidget(listItemData);
                this._setupSpecEvent(step);
                dojoConstruct.place(step.listItemWidget.domNode,this.wizardStepsListNode,"last");
            }));
            
            
            this._setupEvents(callback);
        },
        
        _setupSpecEvent:function(step) {
            var domNode = step.listItemWidget.domNode;
            var clickedIndex,clickedStep;
            
            step.clickListener = this.connect(domNode, "click", dojoLang.hitch(this, function(e){
                clickedIndex = e.currentTarget.getAttribute("data-id");
                clickedStep = this._wizardStepList[clickedIndex].context;                
                
                if (this.navigationMicroflow && this.navigationMicroflow !== "") {
                    var id = clickedStep.getGuid();
                    
                    mx.data.action({
                        params          : {
                            applyto     : "selection",
                            actionname  : this.navigationMicroflow,
                            guids       : [id]
                        },
                        callback        : function(success) {
                            // if success was true, the microflow was indeed followed through
                        },
                        error           : function(error) {
                            // if there was an error
                        } 
                    }, this);
                    
                }
            }));  
        },
        
        // Attach events to HTML dom elements
        _setupEvents: function(callback) {
            callback();
        },

        // Resetting the widget after getting results
        _resetWidget: function() {
            // remove the steps if present
            if (this._wizardStepList && this._wizardStepList.length > 0) {
                dojoArray.forEach(this._wizardStepList,dojoLang.hitch(this,function(step,i){
                    this.disconnect(step.clickListener);
                    step.listItemWidget.destroy();
                    step = null;
                }));
            }
            this._numberOfSteps = 0;
            this._wizardStepList = [];
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions. 
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._resetSubscriptions();
                        this._resetWidget();
                        // add an empty function as a callback to the widget
                        this._getData( function(){} );
                    })
                });
            }
        }
    });
});

require(["WizardSteps/widget/WizardSteps"], function() {
    "use strict";
});
