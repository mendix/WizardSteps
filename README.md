# WizardSteps
Provides an enhanced widget version of the Wizard Steps Header from the Mendix UI Framework pagetemplates.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Description

The WizardSteps widget provides an enhanced version of the Mendix UI Framework Pagetemplates Wizard Steps. Offering additional options such as allowing for conditional wizard steps, vertical and horizontal layouts, numbering modes and many other possibilities. (Note that no pagetemplates nor Mendix Framework is needed to work with this widget)

## Implementation

The WizardSteps widget will need some modeling work to be done. Basically we need to create a WizardStepsList containing all the Wizard Steps that are relevant.

1. Create a Wizard Step entity containing:
- Title : String
- Subtitle (optional) : String
- Status (normal, active, visited) : Enumeration
- Sort attribute: Integer
2. Create a Wizard Step List entity containing all the steps.
3. Create a Microflow that retrieves the Wizard Steps and returns them in a list.
4. Create the actual Step- and Listobjects with data in them.
5. Add the WizardSteps widget to a page and configure the widget as required.

## Settings
### General
- Progress Wizard: style the wizard like the progress version from the Mendix UI Framework.
- Layout Mode: Whether to use horizontal or vertical layout for the steps. Horizontal is default.
- Numbering Mode: How to number and show or not show this number in the steps.
- Full Width: Divide the total width of the wizard into equal columns for each step. If set to false, the steps themselves will determine the needed width. Note: only applicable for horizontal layout Mode
- Onclick microflow: Which microflow needs to be triggered on clicking a step. The actual step object will be returned by the widget.

### Data source
- Wizard step object: the entity that is the wizard step.
- Data microflow for steps: the microflow that returns a list of WizardStep objects.
- Use context object: Used for the onClick microflow. If set to false, the contextobject will not be part of the call.

### Step definition
- Title
- Subtitle
- Status
- Sort attribute

## Notes
Logic needs to be modeled in Mendix itself with regards to getting to next or previous steps. The Widget itself is very 'dumb' in that way and needs to be. Every step can be clicked, so the intended behaviour will need to be handled in Mendix.

The original foundation version of the WizardSteps widget actually had other datasource options as well such as XPath and by Association to collect these. We've created a separate branch ([original-bloated-version](https://github.com/mendix/WizardSteps/tree/original-bloated-version) of this version which can be viewed in Github.

The latest (but not always appstore ready) version can be found on [github](https://github.com/mendix/WizardSteps)
## Compatibility
The widget was created in Mendix version 5.18 but it should work from 5.14.1 onwards although untested.
The latest Mendix version it was tested in is version 6.2 so Mendix 6 is compatible.

## Release Notes
1.0 appstore release:
- first appstore version of the widget