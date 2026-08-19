window.ClockWidget = (function () {
  var clockEl = null;
  var dateEl = null;
  var calPopover = null;
  var calTitle = null;
  var calGrid = null;
  var calViewDate = null;
  var settings = null;

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SHORT_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  function init(config) {
    clockEl = config.clockEl;
    dateEl = config.dateEl;
    calPopover = config.calPopover;
    calTitle = config.calTitle;
    calGrid = config.calGrid;
    settings = config.settings;
    calViewDate = new Date();

    dateEl.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = calPopover.classList.contains('open');
      if (isOpen) {
        calPopover.classList.remove('open');
      } else {
        calViewDate = new Date();
        renderCalendar();
        calPopover.classList.add('open');
      }
    });

    config.calPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      calViewDate.setMonth(calViewDate.getMonth() - 1);
      renderCalendar();
    });

    config.calNext.addEventListener('click', function (e) {
      e.stopPropagation();
      calViewDate.setMonth(calViewDate.getMonth() + 1);
      renderCalendar();
    });

    document.addEventListener('click', function (e) {
      if (!calPopover.contains(e.target) && e.target !== dateEl) {
        calPopover.classList.remove('open');
      }
    });

    tick();
    setInterval(tick, 1000);
  }

  function updateSettings(s) {
    settings = s;
    tick();
  }

  function tick() {
    var now = new Date();
    var h = now.getHours();
    var m = Helpers.pad(now.getMinutes());
    var s = Helpers.pad(now.getSeconds());
    var hourStr, suffix = '';

    if (settings.clockFormat === '12') {
      suffix = h >= 12 ? ' PM' : ' AM';
      var h12 = h % 12;
      if (h12 === 0) h12 = 12;
      hourStr = h12.toString();
    } else {
      hourStr = Helpers.pad(h);
    }

    var clockText = document.createTextNode(hourStr + ':' + m);
    var span = document.createElement('span');
    span.className = 'secs';
    span.textContent = s + suffix;

    clockEl.textContent = '';
    clockEl.appendChild(clockText);
    clockEl.appendChild(span);

    dateEl.textContent = DAYS[now.getDay()] + ', ' + MONTHS[now.getMonth()] + ' ' + now.getDate();
  }

  function renderCalendar() {
    var year = calViewDate.getFullYear();
    var month = calViewDate.getMonth();
    calTitle.textContent = MONTHS[month] + ' ' + year;

    calGrid.textContent = '';

    SHORT_DAYS.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calGrid.appendChild(el);
    });

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrevMonth = new Date(year, month, 0).getDate();
    var today = new Date();

    for (var i = firstDay - 1; i >= 0; i--) {
      var el = document.createElement('div');
      el.className = 'cal-day other-month';
      el.textContent = daysInPrevMonth - i;
      calGrid.appendChild(el);
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var el = document.createElement('div');
      el.className = 'cal-day';
      if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        el.classList.add('today');
      }
      el.textContent = d;
      calGrid.appendChild(el);
    }
    var totalCells = firstDay + daysInMonth;
    var trailing = (7 - (totalCells % 7)) % 7;
    for (var d = 1; d <= trailing; d++) {
      var el = document.createElement('div');
      el.className = 'cal-day other-month';
      el.textContent = d;
      calGrid.appendChild(el);
    }
  }

  return {
    init: init,
    updateSettings: updateSettings
  };
})();
