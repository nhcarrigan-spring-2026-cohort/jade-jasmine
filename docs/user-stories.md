# MVP

## User Stories (common)

1. As a user, I want to contact the website developer to ask them to delete my account or the associated food bank info or to report a bug.

### User Stories (for a food seeker)

1. As a food seeker, I want to look for a specific food item that is located within a certain # of km from me. (in a nearby locale - within certain # km -> maybe this becomes more flexible to use other units later. This means we need to get the user's location first or ask them to provide the search area/city. See **)
2. As a food seeker, I want to locate a nearby food bank so I can review their location or opening hours (or contact details) -> hours should appear in a localized way (see **)
3. As a food seeker, I want to search for a food bank by name (search by name) so I can review their details
4. As a food seeker, I want to find food by category (e.g. baby food) so that I can see which food bank in a certain radius has it. (See **)


### User Stories (for a a food bank/pantry admin/staff)

1. As a food bank admin, I want to register my food bank so that I can use this app... (I give you my name, location, hours, website, contact info. This involves 2 steps. I must register the food bank itself and also register myself as the admin. We need to stop people from duplicating entries here by checking the address and charity number as one idea to make sure we don't have duplicate entries by different people)
2. As a food bank registered user, I want to be able to login with my userid and password in order to manage a food bank entry or a food entry etc.
2. As a food bank admin, I want to reset my password because i may have forgotten it.
3. As a food bank admin, I want to assign/promote an existing user to be a second food bank admin (in the case of someone leaving, they assign a new person who then deletes the old person as an admin. This has to be done with a unique user id? which is then displayed with a name to confirm before it is saved as such.)
4. As a food bank admin, I want to delete one of the 2 admins. (needs to be confirmed before being done, but this doesn't actually remove the user record, it just removed the association between the user record and the food bank)
5. As a food bank administrator, I want to log in (as staff, so securely) so I can modify the food bank contact details or name or opening hours.
6. As a food bank member of staff, I want to register as a user of the app so that the food bank admin can add me as an employee later.
7. As a food bank member of staff, I want to reset my password as I may have forgotten it.
8. As a food bank admin, I want to add or remove a specific user who works for me by via their user id in order to add or remove them from my food bank employee list.
9. As a food bank member of staff, I want to add/delete/update food items (name, description, min-amount, category, barcode)
10. As a food bank member of staff, I want to add/subtract food quantity/inventory
11. As a food bank member of staff, I can create or delete a box (what it contains in terms of food)
12. As a food bank member of staff, I want to add/subtract/modify a box (add/subtract quantity and/or modify name)
13. As a food bank member of staff, I want to modify the list of foods in a specific box (whether add more or delete some from this box)
14. As a food bank member of staff, I need to create food categories (or delete/update them)
15. As a food bank member of staff, I need to be informed if I already have a registered account with my email address so that I can either use it to login or reset the password if i forgot it.

** MVP would be for the user to give us the city and we search in our db directly for it rather than go through google's map api
Note: Deleting a category or a box should not delete the food items that were associated with it.
Note: Deleting the food bank info should cause all orphaned food items to be deleted??? (check)

### Nice to have features

1. As a food bank, I can state that I am looking for volunteers (maybe that entails hours/rules/applications/references)
2. As a volunteer, I am looking to volunteer somewhere (??? figure it out later)
3. As a food bank admin, I can toggle 'temporarily closed' button to indicate that the food bank has closed until further notice.
4. As a food bank admin, I can toggle 'temporarily closed' button to indicate that