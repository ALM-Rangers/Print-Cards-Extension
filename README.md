# Print Cards

![](https://almrangers.visualstudio.com/DefaultCollection/_apis/public/build/definitions/7f3cfb9a-d1cb-4e66-9d36-1af87b906fe9/89/badge)

### What
This extension adds a print option to the backlog which allows you to print the cards for use on a physical scrum board. Print cards have QR Codes used to bridge the physical and digital boards.

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

### Find out more
Check out the [Print Cards journal](https://github.com/ALM-Rangers/VSTS-Extension-PrintCards/blob/master/VSTS%20extension%20journal.md), where you can find out how the extension was created and some of the bumps along the way.

Install the extension [here](https://marketplace.visualstudio.com/items/ms-devlabs.PrintCards).

![In VSO screen shot of Print Cards](https://github.com/ALM-Rangers/VSTS-Extension-PrintCards/blob/master/src/VSO.PrintCards/images/image1.png)
![Printed print cardss](https://github.com/ALM-Rangers/VSTS-Extension-PrintCards/blob/master/src/VSO.PrintCards/images/image2.png)

###Contribute
Contributions to Print Cards are welcome. Here is how you can contribute to Print Cards:  

- Submit bugs and help us verify fixes  
- Submit pull requests for bug fixes and features and discuss existing proposals   

Please refer to [Contribution guidelines](.github/CONTRIBUTING.md) and the [Code of Conduct](.github/COC.md) for more details.


<table>
  <tr>
    <td>
      <img src="https://github.com/ALM-Rangers/VSTS-Extension-PrintCards/blob/master/_img/VSALMLogo.png"></img>
    </td>
    <td>
      The Visual Studio ALM Rangers provide professional guidance, practical experience and gap-filling solutions to the ALM community. Visit <a href="http://aka.ms/vsarblog">aka.ms/vsarblog</a> to find out more.
    </td>
  </tr>
</table>
