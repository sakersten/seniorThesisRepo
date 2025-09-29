# Senior Thesis Repo: [PLACE YOUR PROJECT NAME HERE]
This repository is provided to help you build your senior thesis project. You will edit it to store your specification documents, code, and weekly checkins.

First, fork this repo (this makes a copy of it associated with your account) and then clone it to your machine (this makes a copy of your fork on your personal machine). You can then use an editor and a GitHub client to manage the repository.

### Markdown
This file is called README.md. It is a [Markdown file](https://en.wikipedia.org/wiki/Markdown). Markdown is a simple way to format documents. When a Markdown-ready viewer displays the contents of a file, it formats it to look like HTML. However, Markdown is significantly easier to write than HTML. VSCode supports displaying Markdown in a preview window. GitHub uses Markdown extensively including in every repo's description file, ```README.md```.

All Markdown files end with the extension ```.md```. There is a Markdown tutorial [here](https://www.markdowntutorial.com/) and a Markdown cheatsheet [here](https://www.markdownguide.org/cheat-sheet/).

#### Images
If you would like to add images to a Markdown file, place them in the ```docs/images/``` directory in this repo and reference them using markdown like this:

```
![alt text](relative/path/to/image)
```

Here is how to add the Carthage logo to a Markdown file (you can see the image in the repo right now):

```
![Carthage Firebird Logo](docs/images/firebirdLogo.jpg)
```
![Carthage Firebird Logo](docs/images/firebirdLogo.jpg)

This ensures that images are correctly linked and displayed when viewing the documentation on GitHub or any Markdown-supported platform.

## Code
The ```code``` directory is used to store your code. You can put it all in one directory or you can create subdirectories.

I have added a ```main.cpp``` file to get you started. Feel free to remove it.

If you have any questions feel free to ask me! I'll answer professor questions, customer questions, and give advice if asked.

# Sample Spec

Below is an example of a project specification.  

## Software Requirements Specification for PackPal Mobile Application

## Introduction

### Purpose
The purpose of this document is to outline the functional and non-functional requirements of PackPal, a mobile travel and packing assistant application. PackPal is designed to simplify trip preparation by helping users manage their closet inventory, plan trips, and generate customized packing lists. This specification serves as a shared agreement between stakeholders and developers, ensuring that the app meets user needs while maintaining usability, reliability, and technical consistency.

The key goals of PackPal are:
- To streamline the trip preparation process, reducing the time and effort spent planning and packing.
- To provide users with tools to manage their closet inventory, making packing more accurate and less repetitive.
- To automatically generate tailored packing lists based on trip details such as destination, activities, and duration.
- To ensure secure access to user data through authenticated accounts.

### Scope
PackPal is intended for individual travelers who want to simplify and organize their packing process. The app will support:
- Secure user authentication and access to personal closet and trip data.
- Management of closet items, including adding, editing, and deleting items.
- Trip creation and modification, capturing details such as destinations, dates, activities, bag type, and laundry availability.
- Automatic generation of packing lists based on the user’s closet inventory and trip details.
- Viewing, updating, or deleting trips and closet items as needed.

Additional features include:
- A personalized dashboard displaying upcoming trips and recent closet activity.
- Editing trips or items through pre-filled forms to minimize duplicate entry.
- Input validation to ensure accurate data (e.g., required trip details must be provided).

### Definitions, Acronyms, and Abbreviations
- **Closet Item**: An individual piece of clothing, accessory, or other item that a user owns and may pack for a trip.
- **Trip**: A planned travel event with destinations, duration, and activities, used to generate a packing list.
- **Packing List**: A system-generated list of closet items tailored to a specific trip.
- **User Role**: The traveler who creates, edits, and manages closet items and trips within the system.
- **Authentication**: The process of securely logging in with a username and password to access system features.

## Overview
PackPal is a mobile application designed to help users plan trips and organize their packing efficiently. It combines a virtual closet with a trip planner, giving users an integrated way to manage clothing items and prepare for travel.

### System Features:
The travel and packing assistant system is a web-based platform designed to help users organize trips and generate personalized packing lists. It functions as both a virtual closet and a trip planner, combining inventory management with travel preparation.

1. **Secure Login**: Ensures only authorized users can access the system through authentication with a username and password.
2. **Closet Management**: Users can add, edit, and delete items from their virtual closet to build a comprehensive inventory.
3. **Trip Management**: Users can create, view, edit, and delete trips to specify destinations, duration, activities, bag type, and laundry options.
4. **Packing List Generation**: PackPal generates personalized packing lists automatically from the user’s closet inventory and trip details, with the option to regenerate lists after updates.
5. **Dashboard Overview**: Displays a snapshot of recent closet activity and upcoming trips for quick access.

PackPal is designed to be fast, intuitive, and scalable so that users can manage multiple trips and large closet inventories without performance issues. Utilizing ReactNative, it emphasizes ease of use, security, and personalized travel preparation.

The following sections detail the specific use cases that the system will support, describing how users will interact with the system during typical operations.

## Use Cases

### Use Case 1.1: Secure Login
- **Actors**: User
- **Overview**: User uses password to verify their identity.

**Typical Course of Events**:
1. Page prompts for username and password.
2. User enters credentials and clicks Login.
3. System verifies that the username and password are correct.
4. User is granted access to the application.

**Alternative Courses**:
- **Step 3**: User and/or password are not correct.
  1. Displays error.
  2. Go back to step 1.

### Use Case 1.2: Input New Closet Item
- **Actors**: User
- **Overview**: User adds a new clothing item to store in the application. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays a small selection of closet items (blank if none) and a blurb about the newest upcoming trip (blank if none).
3. User selects *Closet*. 
4. User clicks *Input New Closet Item*. 
5. Display *New Closet Item* Form. 
6. User is prompted to input the closet item with the following required inputs: item type (top, bottom, outerwear, shoes, etc.), style (short-sleeve, long-sleeve, etc.), color (blue, green, etc.), use (casual, fancy, athletic), and season (winter, spring, summer, fall). 
7. User submits the form. 
8. System verifies valid entry (required fields are not left blank).
9. Closet item is saved and displayed in closet inventory. 

**Alternative Courses**:
- **Step 8**: Entry invalid (User clicks submit but a required field is left blank) 
  1. Display error. 
  2. Go back to step 6. 

### Use Case 1.3: Edit Closet Item
- **Actors**: User
- **Overview**: User updates details of an existing closet item.

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays closet items and trip blurb.
3. User selects *Closet*. 
4. User selects *Details* for a specific item in *Closet*. 
5. User selects *Edit Item*.
6. System displays *Edit Item* Form, pre-filled with the current item details.
7. User modifies one or more fields and submits.
8. System verifies valid entry (required fields are not left blank). 
9. Display updated item details and confirmation of successful update.

**Alternative Courses**:
- **Step 7**: User cancels edit
  1. Discard changes. 
  2. Return to *Closet Item Details* without updating the item.

- **Step 8**: Entry invalid (User clicks submit but a required field is left blank)
  1. Display error.
  2. Go back to step 6. 

### Use Case 1.4: Delete Closet Item
- **Actors**: User
- **Overview**: User deletes a closet item. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays closet items and trip blurb.
3. User selects *Closet*. 
4. User selects *Details* for a specific item in *Closet*. 
5. User selects *Delete Item*.
6. System prompts for confirmation ("Are you sure you want to delete this item?"). 
7. User confirms deletion. 
8. Displays that the item was successfully deleted. 

**Alternative Courses**:
- **Step 5**: Delete invalid
  1. Display error.
  2. Go back to step 4. 

- **Step 6**: User cancels deletion
  1. Return to **Closet Item Details*. 

### Use Case 1.5: Input New Trip
- **Actors**: User
- **Overview**: User creates a new trip event. 

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays closet items and trip blurb. 
3. User selects *Trips*.
4. User selects *Create New Trip*.
5. Display *New Trip* Form. 
6. User is prompted to input details about their trip with the following required inputs: destination(s) (at least one location is required, but can have multiple), duration (in days), bag details (backpack only, carry-on, checked bag), trip activities (sightseeing, hiking, etc.), and if laundry is available (clothes can then be reused). 
7. User submits the form. 
8. System verifies valid entry (required fields are not left blank). 
9. Trip is saved and displayed in *Trips*. 
10. System automatically generates a packing list based on closet items and trip details. 
11. Packing list is displayed alongside trip information. 

**Alternative Courses**:
- **Step 8**: Entry invalid (User clicks submit but a required field is left blank)
  1. Display error. 
  2. Go back to step 5. 

### Use Case 1.6: Edit Trip
- **Actors**: User
- **Overview**: User updates details of an existing trip.

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays closet items and trip blurb.
3. User selects *Trips*. 
4. User selects *Details* for a specific trip.
5. User selects *Edit Trip*. 
6. Displays *Edit Trip* Form, pre-filled with the current trip details.
7. User modifies one or more fields and submits.
8. System verifies valid entry (required fields are not left blank). 
9. Display updated trip details and confirmation of successful update.

**Alternative Courses**:
- **Step 7**: User cancels edit
  1. Discard changes. 
  2. Return to *Trip Details* without updating the trip. 

- **Step 8**: Entry invalid (User clicks submit but a required field is left blank)
  1. Display error.
  2. Go back to step 6.

### Use Case 1.7: Delete Trip
- **Actors**: User
- **Overview**: User deletes a trip and its associated packing list.

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays closet items and trip blurb.
3. User selects *Trips*. 
4. User selects *Details* for a specific trip.
5. User selects *Delete Trip*.
6. System prompts for confirmation ("Are you sure you want to delete this trip?"). 
7. User confirms deletion. 
8. Trip and its associated packing list are deleted.

**Alternative Courses**:
- **Step 5**: Delete invalid
  1. Display error.
  2. Go back to step 4. 

- **Step 6**: User cancels deletion
  1. Return to *Trip Details*. 

### Use Case 1.8: Regenerate Packing List
- **Actors**: User
- **Overview**: User regenerates a packing list for an existing trip after editing closet items or trip details.

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Dashboard displays closet items and trip blurb.
3. User selects *Trips*. 
4. User selects *Details* for a specific trip.
5. User selects *Regenerate Packing List*.
6. System analyzes current closet inventory and trip details.
7. System generates a new packing list, replacing the old list. 
8. Display updated packing list with confirmation.

**Alternative Courses**:
- **Step 6**: Closet is empty or no valid matches
  1. Display message: *No items available to generate a packing list. Please add closet items*. 
  2. Return to *Trip Details*. 
