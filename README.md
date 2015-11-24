# Print Cards
### What

This extension adds a print option to the backlog which allows you to print the cards for use on a physical scrum board.

### Why

Having a physical scrum board can allow those inside and outside the team a quick view location for the status of the work and the act of moving physical cards has a more real and tangible feel than just clicking on a screen.

### Steps
1. Clone this repo
2. Browse to the folder of the extension
3. Publish the contents of the extension to a local or cloud web server
4. The root of the extension should be at the root of the web server, for example: https://myserver/images/fabrikam-logo.png
5. Update the extension manifest file (extension.json). To do this, update the  namespace field to a globally unique value. For example: johnsmith.samples.foldermanagement. Also, update the  baseUri  field to be the fully qualified URL to the root of your web server, for example:  https://myserver 
8. Install the extension into your Visual Studio Team Services account (see https://www.visualstudio.com/en-us/integrate/extensions/publish/overview)

### Prerequisites

A Visual Studio Team Services project and some work items.

### Usage

Install the Extension in your account. Go to the backlog and click the print button (in the top right corner of the screen).