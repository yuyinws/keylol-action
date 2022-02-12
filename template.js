const mjml2html = require('mjml');

const htmlOutput = mjml2html(`
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello World!
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`)

/*
  Print the responsive HTML generated and MJML errors if any
*/
console.log(htmlOutput)