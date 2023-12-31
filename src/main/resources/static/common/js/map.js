/**
* 지도 확대 레벨
*
*/
var commonLib = commonLib || {};
commonLib.map = {
   level : 2, // 지도 확대 레벨
   container : null,
   overlay : null,
   /**
   * 지도를 표시할 dom 생성
   *
   */
   getMapContainer(id) {
       this.container = document.getElementById(id)
       return this.container;
   },
   create(options) {
        return new kakao.maps.Map(this.container, options);
   },
   /**
    * 주소로 좌표 확인하기
    *
    */
    getLatLngByAddress(address) {
        const geocoder = new kakao.maps.services.Geocoder();
        return new Promise((resolve, reject) => {
            geocoder.addressSearch(address, function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    const position = new kakao.maps.LatLng(result[0].y, result[0].x);
                    resolve(position);
                } else {
                    reject(result);
                }
            });

        });
    },
    loadMap(id, xpos, ypos) {
        const mapApi = this;
        const position = new kakao.maps.LatLng(xpos, ypos);
        const mapContainer = mapApi.getMapContainer("map"), // 지도를 표시할 div
            mapOption = {
               center: position, // 지도의 중심좌표
               level: mapApi.level // 지도의 확대 레벨
           };

        const map = mapApi.create(mapOption); // 지도를 생성합니다
         // 지도에 표시된 마커 객체를 가지고 있을 배열입니다
         const markers = [];
         addMarker(position); // 초기 마커

         // 마커를 생성하고 지도위에 표시하는 함수입니다
         function addMarker(position) {
            hideMarkers();

            // 마커를 생성합니다
            const marker = new kakao.maps.Marker({ position });

            // 마커가 지도 위에 표시되도록 설정합니다
            marker.setMap(map);
            const infoTitle = document.getElementById("map_info_title");
            const infoAddress = document.getElementById("map_info_address");
            const infoHomepage = document.getElementById("map_info_homepage");
            if (infoTitle && infoTitle.value.trim() && infoAddress && infoAddress.value.trim()) {
            let homePageHtml = "";
            if (infoHomepage && infoHomepage.value.trim()) {
                homePageHtml = `<div><a href="${infoHomepage.value}" target="_blank" class="link">${infoTitle.value}</a></div>`;
            }
            const content = `<div class="wrap">
                          <div class="info">
                               <div class="title">
                                   ${infoTitle.value}
                                   <div class="close" onclick="closeOverlay()" title="닫기"></div>
                              </div>
                              <div class="body">
                                  <div class="desc">
                                       <div class="ellipsis">${infoAddress.value}</div>
                                       ${homePageHtml}
                                    </div>
                               </div>
                           </div>
                        </div>`;

                // 마커 위에 커스텀오버레이를 표시합니다
                // 마커를 중심으로 커스텀 오버레이를 표시하기위해 CSS를 이용해 위치를 설정했습니다
                const overlay = new kakao.maps.CustomOverlay({
                    content: content,
                    position: marker.getPosition()
                });

                commonLib.map.overlay = overlay;

                 // 마커를 클릭했을 때 커스텀 오버레이를 표시합니다
                 kakao.maps.event.addListener(marker, 'click', function() {
                    overlay.setMap(map);
                 });

            }



            // 생성된 마커를 배열에 추가합니다
            markers.push(marker);

            }




            // 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
            function setMarkers(map) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
            }

            // "마커 보이기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에 표시하는 함수입니다
            function showMarkers() {
                setMarkers(map)
            }

            // "마커 감추기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에서 삭제하는 함수입니다
            function hideMarkers() {
                setMarkers(null);
            }

            // 지도를 클릭했을때 클릭한 위치에 마커를 추가하도록 지도에 클릭이벤트를 등록합니다
            const isViewPageEl = document.querySelector("input[name='isViewPage']");
            const isViewPage = isViewPageEl && isViewPageEl.value == 'true' ? true : false;
            // 보기 페이지가 아닌 경우는 클릭 이벤트 추가, 보기페이지 인 경우는 클릭 이벤트 제한
            if (!isViewPage) {
                kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                        const latLng = mouseEvent.latLng;
                        // 클릭한 위치에 마커를 표시합니다
                        console.log(latLng);
                        addMarker(latLng);

                        const ypos = latLng.La;
                        const xpos = latLng.Ma;

                        xposEl.value = xpos;
                        yposEl.value = ypos;
                    });

            }

    }

}

window.addEventListener("DOMContentLoaded", function() {
    const {map : mapApi } = commonLib;
    const xposEl = document.querySelector("input[name='xpos']");
    const yposEl = document.querySelector("input[name='ypos']");
    const roadAddressEl = document.querySelector("input[name='roadAddress']");
    if (roadAddressEl && roadAddressEl.value.trim()) {
        const address = roadAddressEl.value.trim();

        mapApi.getLatLngByAddress(address)
            .then((res) => {
                mapApi.loadMap("admin_map", res.Ma, res.La);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        const xpos = xposEl && xposEl.value ? xposEl.value : 33.450701;
        const ypos = yposEl && yposEl.value ? yposEl.value : 126.570667;
        mapApi.loadMap("admin_map", xpos, ypos);
    }
});


// 커스텀 오버레이를 닫기 위해 호출되는 함수입니다
function closeOverlay(map){
    commonLib.map.overlay.setMap(null);
}

