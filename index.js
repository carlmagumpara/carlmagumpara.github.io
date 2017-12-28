// jQuery Functions
$(document).ready(function(){
  $('body').click(function(){
    $('.data-entry').focus()
  })
  inputResize()
  function inputResize(){
    carl_root = $('.carl-root').width() + 10
    screen_width = $(window).innerWidth()
    $('.data-entry').css('width', screen_width - carl_root)
  }
  $(window).on('resize',function(){
    inputResize()
  })
})

// Console.log
console.oldLog = console.log;
console.log = function(log) {
  console.oldLog(log)
  window.$log = log;
}

// Vue Functions
new Vue({
  el: '#cli',
  data: {
    data_entry: null,
    intro: [{
      data: 'CLI - Carl Anthony Magumpara. 2017'
    },
    {
      data: 'Site: <a href="https://carlmagumpara.github.io" class="link" target="_blank">https://carlmagumpara.github.io</a>'
    },
    {
      data: 'Facebook: <a href="https://facebook.com/carlmagumpara" class="link" target="_blank">https://facebook.com/carlmagumpara</a>'
    },
    {
      data: 'Email: <a href="mailto:magumparacarlanthony@gmail.com" class="link" target="_top">magumparacarlanthony@gmail.com</a>'
    },
    {
      data: 'LinkedIn: <a href="https://www.linkedin.com/in/carl-anthony-magumpara-248a18125/" class="link" target="_blank">https://www.linkedin.com/in/carl-anthony-magumpara-248a18125/</a>'
    },
    {
      data: 'Learn More: Type `help` to find out more available commands.'
    }],
    data_results: [],
    data_history: [],
    count_history: 0,
    ip_address: ''
  },
  created(){
    vm = this
    if (localStorage.data_results != null) {
      vm.data_results = JSON.parse(localStorage.data_results)
    } else {
      this.data_results = this.intro
    }
    if (localStorage.data_history != null) {
      vm.data_history = JSON.parse(localStorage.data_history)
    }
    if (localStorage.data_entry != null) {
      vm.data_entry = localStorage.data_entry
    }
    $.get("https://ipinfo.io", function(response) {
        vm.ip_address = response.ip
    }, "jsonp")
  },
  methods: {
    processData(){
      $('html, body').animate({ scrollTop: $(document).height() }, 100)
      this.count_history = 0
      data_entry = this.data_entry
      data_results = this.data_results
      data_history = this.data_history
      if (data_entry) {
        data_results.push({ data: '<span class="carl-root"></span>'+data_entry })
        data_history.push(data_entry)
        if (data_entry.slice(0, 2) === 'js') {
          main = 'try { '+data_entry.slice(3, Infinity)+' } catch(err) {  console.log(err.message) }'
          data = $('<script></script>').text(main)
          $('.date_results_container').append(data)
          try {
            data_results.push({ data: $log })
          } catch(err) {
            data_results.push({ data: 'Use console.log to see results' })
          }
          this.data_entry = ''
        } 
        else if (data_entry.slice(0, 5) === 'color') {
          promp = false
          if (data_entry === 'color') {
            promp = true
            data = '<table><tr><td> 0 = Black </td> <td> 8 = Gray </td></tr><tr><td>1 = Blue </td> <td> 9 = Light Blue </td> </tr><tr><td> 2 = Green </td> <td> A = Light Green </td></tr><tr><td> 3 = Aqua </td> <td> B = Light Aqua </td></tr><tr><td> 4 = Red </td> <td> C = Light Red </td></tr><tr><td> 5 = Purple </td> <td> D = Light Purple </td></tr><tr><td> 6 = Yellow </td> <td>E = Light Yellow </td></tr><tr><td> 7 = White</td> <td> F = Bright White </td></tr><table> <br> Just type `color` + variable.'
          } else {
            text_color = data_entry.slice(6, Infinity)
            switch(text_color) {
              case '0':
                color = 'black'
                break;
              case '1':
                color = 'blue'
                break;
              case '2':
                color = 'green'
                break;
              case '3':
                color = 'aqua'
                break;
              case '4':
                color = 'red'
                break;
              case '5':
                color = 'purple'
                break;
              case '6':
                color = 'yellow'
                break;
              case '7':
                color = 'white'
                break;
              case '8':
                color = 'gray'
                break;
              case '9':
                color = 'lightblue'
                break;
              case 'A':
                color = 'lightgreen'
                break;
              case 'B':
                color = 'lightaqua'
                break;
              case 'C':
                color = 'lightred'
                break;
              case 'D':
                color = 'lightpurple'
                break;
              case 'E':
                color = 'lightyellow'
                break;
              case 'F':
                color = 'brightwhite'
                break;
              default:
                promp = true
                data = 'Color '+data_entry.slice(6, Infinity)+' is undefined. Please type "color" to see available colors.'
                color = 'white'
            }
            $('body, .data-entry').css('color', color)
          }
          if (promp) {
            data_results.push({ data: data })
          }
          this.data_entry = ''
        }
        else if (data_entry.slice(0, 16) === 'background-color') {
          promp = false
          if (data_entry === 'background-color') {
            promp = true
            data = '<table><tr><td> 0 = Black </td> <td> 8 = Gray </td></tr><tr><td>1 = Blue </td> <td> 9 = Light Blue </td> </tr><tr><td> 2 = Green </td> <td> A = Light Green </td></tr><tr><td> 3 = Aqua </td> <td> B = Light Aqua </td></tr><tr><td> 4 = Red </td> <td> C = Light Red </td></tr><tr><td> 5 = Purple </td> <td> D = Light Purple </td></tr><tr><td> 6 = Yellow </td> <td>E = Light Yellow </td></tr><tr><td> 7 = White</td> <td> F = Bright White </td></tr><table><br> Just type `background-color` + variable.'
          } else {
            text_color = data_entry.slice(17, Infinity)
            switch(text_color) {
              case '0':
                color = 'black'
                break;
              case '1':
                color = 'blue'
                break;
              case '2':
                color = 'green'
                break;
              case '3':
                color = 'aqua'
                break;
              case '4':
                color = 'red'
                break;
              case '5':
                color = 'purple'
                break;
              case '6':
                color = 'yellow'
                break;
              case '7':
                color = 'white'
                break;
              case '8':
                color = 'gray'
                break;
              case '9':
                color = 'lightblue'
                break;
              case 'A':
                color = 'lightgreen'
                break;
              case 'B':
                color = 'lightaqua'
                break;
              case 'C':
                color = 'lightred'
                break;
              case 'D':
                color = 'lightpurple'
                break;
              case 'E':
                color = 'lightyellow'
                break;
              case 'F':
                color = 'brightwhite'
                break;
              default:
                promp = true
                data = 'Color '+data_entry.slice(17, Infinity)+' is undefined. Please type "backgound-color" to see available colors.'
                color = 'black'
            }
            $('body').css('background-color', color)
          }
          if (promp) {
            data_results.push({ data: data })
          }
          this.data_entry = ''
        }
        else {
          promp = true
          switch(data_entry) {
            case 'clear':
              promp = false
              this.data_results = []
              this.data_history = []
              this.data_entry = ''
              this.count_history = 0
              break;
            case 'exit':
              data = 'exit'
              history.back()
              break;
            case 'reset':
              promp = false
              this.data_results = this.intro
              this.data_history = []
              this.data_entry = ''
              this.count_history = 0
              break;
            case 'help':
              data = 'about: About this CLI. <br> history: Command history. <br> clear: Clear the screen. <br> reset: Reset CLI. <br> js + javascript code: You can test your javascript code here. just use console.log for the result. <br> ip: Show your IP address. <br> color: Setting for changing CLI text color. <br> background-color: Setting for changing CLI background color <br>'
              break;
            case 'ip':
              data = this.ip_address
              break;
            case 'about':
              data = 'This CLI (command-line user interface) is just only my personal use. It is written in HTML, JAVASCRIPT (VUE , JQUERY). <br> '
              break;
            case 'date':
            case 'date now':
              date = new Date().toDateString();
              data = 'Date now is '+date
              break;
            case 'time':
            case 'time now':
              time = new Date().toLocaleTimeString();
              data = 'Time now is '+time
              break;
            case 'history':
              list = ''
              for (var i = 0; i < this.data_history.length; i++) {
                list += this.data_history[i]+'<br>' 
              }
              data = list
              break;
            default:
              data = '<span class="carl-root"></span><span class="error"> `'+this.data_entry+'` </span>' 
          }
          if (promp) {
            data_results.push({ data: data })
          }
          this.data_entry = ''
        }
      } else {
        data_results.push({ data: '<span class="carl-root"></span>' })
      }
      localStorage.data_results = JSON.stringify(this.data_results)
      localStorage.data_history = JSON.stringify(this.data_history)
    },
    storeDataEntry(){
      localStorage.data_entry = this.data_entry
    },
    showHistoryUp(){
      count_history = this.count_history
      if (count_history < this.data_history.length) {
        this.count_history = count_history + 1
        history_length = this.data_history.length - count_history
        this.data_entry = this.data_history[history_length]
      }
    },
    showHistoryDown(){
      count_history = this.count_history
      if (count_history > 0) {
        this.count_history = count_history - 1
        history_length = this.data_history.length - count_history
        this.data_entry = this.data_history[history_length]
      }
    }
  }
})
