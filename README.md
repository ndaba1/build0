## Roadmap
- [x] Allow users to define pdfmake templates
- [x] These templates are saved somewhere in the db and can accept variables
- [ ] Have a simple sdk that allows users to generate pdfs using these templates
- [x] Or even a rest API that allows users to generate pdfs using these templates
- [ ] Logger service to show generation process
- [x] S3 integration to pre-sign and upload/download said pdfs
- [x] Image previews ???

lets have the template generator be an editor where you can write a javascript function (generate) that returns a pdfmake template. This function can accept variables and return a template that uses these variables. The template can be saved in the db and used to generate pdfs. We can have certain global variables depending on the organization that can be used in the template. i.e logo url, organization name, etc.
Integrate with monaco editor to see how to make the variables available.

Show a preview of the pdf template using pdfmake. This can be done by generating a pdf and showing it in an iframe.

self hosted and deployed using sst ion.


- toploader
- custom cognito scopes
- custom fonts, brand colors in template form
- mintlify and speakeasy
- screenshot/previews of pdfs
- shareable templates (with previews)
- when storing templates, also store img preview
- update template to include integration settings i.e knock workflow ?
- load testing - many requests, many pages
- going live ? existing vpc
- preview generation also job - should be re-runnable. group 
- webhooks ?
- custom fonts ?????
- integration with other services


1. Dashboard
- [ ] plug into using actual data
- [ ] update the bottom components
- [ ] add date picker, enable filtering

1. Jobs tabs
- [ ] paginate via infinite scroll/manual clicking
- [ ] date picker, filtering
- [ ] searching
- [ ] BE - rerun jobs
- [x] BE - job logs integration --> OUT OF SCOPE
- [ ] BE - link to ref job
- [x] sdk/api buttons

1. Docs
- [ ] sdk/api buttons
- [ ] doc previews ?
- [ ] download document
- [ ] listing with pagination, filtering
- [ ] doc search
- [ ] more functionality

1. Docs
- [ ] edit template ?
- [ ] preview template
- [ ] BE - auto payload generation (for testing)
- [ ] require document format


3. Settings
- [ ] workspace settings ?
- [ ] account settings
- [ ] BFE - user management
- [ ] BFE - token management
- [ ] BFE - Variables
- [ ] FE - cleanup doc types table

4. Auth
- [ ] sign out
- [ ] clean up
- [ ] fix withAuth wrapper

5. Others
- [ ] External ID
- [ ] Webhooks ?
- [ ] workspaces, i.e make cloud viable