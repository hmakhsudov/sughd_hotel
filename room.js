(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var id = params.get('room');
  var room = ROOMS.find(function (r) { return r.id === id; }) || ROOMS[0];
  var gi = 0;

  var mainImg = document.getElementById('mainImg');
  var galleryCount = document.getElementById('galleryCount');
  var lbImg = document.getElementById('lbImg');
  var lbPosition = document.getElementById('lbPosition');
  var thumbStrip = document.getElementById('thumbStrip');
  var lbThumbs = document.getElementById('lbThumbs');
  var lightbox = document.getElementById('lightbox');

  function svgCheck() {
    return '<svg viewBox="0 0 16 16" fill="none" stroke="var(--ac)" stroke-width="1.4"><path d="M2.5 8.5l3.5 3.5L14 4"/></svg>';
  }

  function setMainImage(i, animate) {
    gi = i;
    var src = room.gallery[gi];
    if (animate) {
      mainImg.style.opacity = '0';
      setTimeout(function () { mainImg.src = src; mainImg.style.opacity = '1'; }, 90);
    } else {
      mainImg.src = src;
    }
    galleryCount.textContent = room.gallery.length + ' фото';
    lbPosition.textContent = (gi + 1) + ' / ' + room.gallery.length;
    lbImg.src = src;
    document.querySelectorAll('.thumb').forEach(function (b, idx) { b.classList.toggle('active', idx === gi); });
    document.querySelectorAll('.lb-thumb').forEach(function (b, idx) { b.classList.toggle('active', idx === gi); });
  }

  /* hero */
  document.getElementById('roomCat').textContent = room.cat + ' · Гостиница «Сугд»';
  document.getElementById('roomTitle').textContent = room.title;
  document.getElementById('roomMeta').textContent = room.guests + ' · ' + room.bed + ' · ' + room.extra;
  document.title = room.title + ' — Гостиница «Сугд»';
  mainImg.alt = room.title;
  lbImg.alt = room.title;
  document.getElementById('lbTitle').textContent = room.title;

  room.gallery.forEach(function (src, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'thumb'; b.setAttribute('aria-label', 'Фото номера');
    var img = document.createElement('img'); img.src = src; img.alt = '';
    b.appendChild(img);
    b.addEventListener('click', function () { setMainImage(i, true); });
    thumbStrip.appendChild(b);

    var lb = document.createElement('button');
    lb.type = 'button'; lb.className = 'lb-thumb'; lb.setAttribute('aria-label', 'Фото номера');
    var limg = document.createElement('img'); limg.src = src; limg.alt = '';
    lb.appendChild(limg);
    lb.addEventListener('click', function () { setMainImage(i, true); });
    lbThumbs.appendChild(lb);
  });
  setMainImage(0, false);

  /* description + amenities */
  document.getElementById('roomDesc').textContent = room.desc;
  var amenList = document.getElementById('amenList');
  room.amen.forEach(function (a) {
    var li = document.createElement('li');
    li.innerHTML = svgCheck() + '<span></span>';
    li.querySelector('span').textContent = a;
    amenList.appendChild(li);
  });

  /* photo strip: next 3 photos after the cover */
  var stripSrcs = room.gallery.slice(1, 4);
  var photoStrip = document.getElementById('photoStrip');
  stripSrcs.forEach(function (src, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'strip-item'; b.setAttribute('data-curtain', ''); b.setAttribute('data-d', (i * 0.1).toFixed(2));
    var img = document.createElement('img'); img.setAttribute('data-img', ''); img.src = src; img.alt = room.title;
    var ov = document.createElement('span'); ov.className = 'ov'; ov.textContent = 'Открыть';
    b.appendChild(img); b.appendChild(ov);
    b.addEventListener('click', function () { setMainImage(i + 1, true); openLightbox(); });
    photoStrip.appendChild(b);
  });

  /* sidebar */
  document.getElementById('sideGuests').textContent = room.guests;
  document.getElementById('sideBed').textContent = room.bed;

  function roomMessage() {
    var dIn = document.querySelector('#sidebarForm [data-checkin]');
    var dOut = document.querySelector('#sidebarForm [data-checkout]');
    var msg = 'Здравствуйте! Интересует номер «' + room.title + '» в гостинице «Сугд».';
    if (dIn && dOut && dIn.value && dOut.value) msg += ' Даты: ' + dIn.value + ' — ' + dOut.value + '.';
    msg += ' Подскажите, пожалуйста, цену и наличие.';
    return msg;
  }
  ['waRoomBtn', 'hdrBookBtn'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', function () { this.href = waLink(roomMessage()); });
  });

  /* other rooms */
  var others = ROOMS.filter(function (r) { return r.id !== room.id; }).slice(0, 3);
  var otherWrap = document.getElementById('otherRooms');
  others.forEach(function (o, i) {
    var a = document.createElement('a');
    a.className = 'rcard';
    a.href = 'room.html?room=' + o.id;
    a.setAttribute('data-rise', '');
    a.setAttribute('data-d', (i * 0.1).toFixed(2));
    a.innerHTML = '<div class="media"><img data-img alt="' + o.title + '"><span class="ov">Смотреть номер →</span></div>'
      + '<span class="kicker"></span><h3></h3><p></p>'
      + '<div class="foot"><span class="price">Цена по запросу</span><span class="arrow">Смотреть →</span></div>';
    a.querySelector('img').src = o.gallery[0];
    a.querySelector('.kicker').textContent = o.cat;
    a.querySelector('h3').textContent = o.title;
    a.querySelector('p').textContent = o.short;
    otherWrap.appendChild(a);
  });

  /* lightbox */
  function openLightbox() { lightbox.hidden = false; }
  function closeLightbox() { lightbox.hidden = true; }
  document.getElementById('galleryBtn').addEventListener('click', openLightbox);
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function () { setMainImage((gi - 1 + room.gallery.length) % room.gallery.length, true); });
  document.getElementById('lbNext').addEventListener('click', function () { setMainImage((gi + 1) % room.gallery.length, true); });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') document.getElementById('lbNext').click();
    if (e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
  });
  var touchX = 0;
  lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; });
  lightbox.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) document.getElementById(dx < 0 ? 'lbNext' : 'lbPrev').click();
  });
})();
