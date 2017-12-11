import jQuery from 'jquery'

export default {
  methods: {
    generateInlineSVG (el, filename, params) {
      // return new Promise((resolve, reject) => {
      // remove the existing svg tag
      this.removeImgTag(el)

      // append a new img tag
      this.appendImgTag(el, filename, params)

      // replace the image tag with a inline svg
      this.replaceImgTag(el, params)
      // })
    },
    // remove the existing svg tag
    removeImgTag (el) {
      let svg = el.getElementsByClassName('svg')[0]
      if (svg) {
        el.removeChild(svg)
      }
    },
    // append a new img tag
    appendImgTag (el, filename, params) {
      let img = document.createElement('img')
      img.src = require('@/assets/imgs/' + filename)
      // img.style.width = params.width - params.padding * 2 + 'px'
      // img.style.height = params.height - params.padding * 2 + 'px'
      img.style.width = params.width + 'px'
      img.style.height = params.height + 'px'
      img.classList.add('svg')
      el.appendChild(img)
    },
    // replace the image tag with a inline svg
    replaceImgTag (el, params) {
      let img = el.getElementsByClassName('svg')[0]
      img.style.fill = params.fill
      // let w   = params.width  - params.padding * 2
      // let h   = params.height - params.padding * 2
      let w   = params.width
      let h   = params.height
      this.replaceWithSVG(img, w, h)
    },
    replaceWithSVG (img, imgWidth, imgHeight) {
      let $img     = jQuery(img)
      let imgID    = $img.attr('id')
      let imgClass = $img.attr('class')
      let imgStyle = $img.attr('style')
      let imgURL   = $img.attr('src')

      jQuery.get(imgURL, function (data) {
        // Get the SVG tag, ignore the rest
        var $svg = jQuery(data).find('svg')

        // Add replaced image's ID to the new SVG
        if (typeof imgID !== 'undefined') {
          $svg = $svg.attr('id', imgID)
        }
        // Add replaced image's classes to the new SVG
        if (typeof imgClass !== 'undefined') {
          $svg = $svg.attr('class', imgClass + ' replaced-svg')
        }
        // Add replaced image's style to the new SVG
        if (typeof imgStyle !== 'undefined') {
          $svg = $svg.attr('style', imgStyle)
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a')

        // Check if the viewport is set, if the viewport is not set the SVG won't scale.
        if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
          $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
        }

        $svg.attr('width', imgWidth + 'px')
        $svg.attr('height', imgHeight + 'px')

        // Replace image with new SVG
        $img.replaceWith($svg)

        console.log('SVG replaced!!')
      }, 'xml')
    }
  }
}
