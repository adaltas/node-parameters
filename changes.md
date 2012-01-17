
List of API changes and enhancements
====================================

Version 0.2.4
-------------

`Shell.question` has been removed, use `req.question` instead
`Shell.confirm` has been removed, use `req.confirm` instead
Add `styles.unstyle`
`detach` option changed in favor of `attach` in `start_stop`
`start_stop` processes are now run as daemon by default

Version 0.2.3
-------------

Parameters routes contrains
Add chdir setting
Workspace discovery start from script root instead of cwd

version 0.2.2
-------------

Plugin Cloud9, HTTP and Redis must be defined before the route plugin
